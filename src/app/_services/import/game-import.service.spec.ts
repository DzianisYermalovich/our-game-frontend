import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { strToU8, zipSync } from 'fflate';
import { GameImportService } from './game-import.service';
import { GameTemplateService } from '../data/local-storage/game-template.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { FakeMediaStorage } from '../../../testing/fake-media-storage';
import { makeGameTemplate, makeValidGame } from '../../../testing/game-fixture';
import { Game } from '../../_models/game';
import { QuestionTypes } from '../../_enums/question-types.enum';

type ZipContents = Record<string, Uint8Array>;

/** Packs the given files (bytes or strings) into a zip File. */
function zipPack(contents: ZipContents): File {
  return new File([zipSync(contents)], 'pack.zip', { type: 'application/zip' });
}

function templateEntry(template: unknown): Uint8Array {
  return strToU8(JSON.stringify(template));
}

/** A fixture Game as a raw pack: pack ids and players ride along, to be ignored. */
function makePack(): Game {
  return makeValidGame();
}

/** The fixture pack plus media refs that must all resolve inside the zip. */
function makePackWithMedia(): Game {
  const pack = makePack();
  pack.images = ['a.png'];
  pack.rounds[0].topics[0].questions[0].image = ['media/b.png'];
  pack.rounds[0].topics[0].questions[0].sound = 'media/c.mp3';
  pack.superRound.questions[0].answerImage = 'd.png';
  return pack;
}

/** A pack whose every media ref resolves. */
function makeMediaPack(): File {
  return zipPack({
    'game.json': templateEntry(makePackWithMedia()),
    'a.png': strToU8('png-bytes'),
    'media/b.png': strToU8('png-bytes'),
    'media/c.mp3': strToU8('mp3-bytes'),
    'd.png': strToU8('png-bytes'),
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('GameImportService', () => {
  let service: GameImportService;
  let templateService: GameTemplateService;
  let errorService: BalloonErrorService;
  let mediaStorage: FakeMediaStorage;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useClass: FakeMediaStorage }],
    });
    service = TestBed.inject(GameImportService);
    templateService = TestBed.inject(GameTemplateService);
    errorService = TestBed.inject(BalloonErrorService);
    mediaStorage = TestBed.inject(MEDIA_STORAGE) as FakeMediaStorage;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function errorText(): string | undefined {
    return errorService.error()?.description;
  }

  function storedTemplate() {
    return templateService.getAll()[0];
  }

  afterEach(() => {
    // jsdom has no StorageManager; drop any per-test stub.
    Object.defineProperty(navigator, 'storage', { value: undefined, configurable: true });
  });

  it('imports a valid pack: template stored, user navigated to its view, no balloon', async () => {
    await service.importPack(makeMediaPack());
    expect(storedTemplate()).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith(['templates', storedTemplate()!.id!]);
    expect(errorService.error()).toBeNull();
  });

  it('ignores pack ids: every stored id is a fresh uuid', async () => {
    await service.importPack(zipPack({ 'game.json': templateEntry(makePack()) }));
    const template = storedTemplate()!;
    expect(template.id).not.toBe('1');
    expect(template.id).toMatch(UUID_PATTERN);
    expect(template.author.id).toMatch(UUID_PATTERN);
    expect(template.settings.id).toMatch(UUID_PATTERN);
    expect(template.rounds[0].id).toMatch(UUID_PATTERN);
    expect(template.rounds[0].topics[0].id).toMatch(UUID_PATTERN);
    expect(template.rounds[0].topics[0].questions[0].id).toMatch(UUID_PATTERN);
    expect(template.superRound.questions[0].id).toMatch(UUID_PATTERN);
  });

  it('drops the roster and answered flags by construction', async () => {
    await service.importPack(zipPack({ 'game.json': templateEntry(makePack()) }));
    const template = storedTemplate() as unknown as Record<string, unknown>;
    expect(template['players']).toBeUndefined();
    const question = templateService.getAll()[0]!.rounds[0].topics[0].questions[0];
    expect('isAnswered' in question).toBe(false);
  });

  it('carries the content verbatim: name, author, texts and image refs', async () => {
    await service.importPack(makeMediaPack());
    const template = storedTemplate()!;
    expect(template.name).toBe('TestGame 1');
    expect(template.author.name).toBe('Author');
    expect(template.images).toEqual(['a.png']);
    expect(template.rounds[0].name).toBe('Round 1');
    expect(template.rounds[0].topics[0].questions[0].sound).toBe('media/c.mp3');
    expect(template.superRound.questions[0].answerImage).toBe('d.png');
  });

  it('stores every referenced media file under the fresh template folder', async () => {
    await service.importPack(makeMediaPack());
    const templateId = storedTemplate()!.id!;
    expect([...mediaStorage.blobs.keys()].sort()).toEqual(
      ['a.png', 'media/b.png', 'media/c.mp3', 'd.png'].map((ref) => `${templateId}/${ref}`).sort(),
    );
    expect(await mediaStorage.get(templateId, 'media/c.mp3')).toBeTruthy();
  });

  it('unreferenced junk files do not block import and are not stored', async () => {
    await service.importPack(
      zipPack({
        'game.json': templateEntry(makePack()),
        '.DS_Store': strToU8('junk'),
        '__MACOSX/._game.json': strToU8('junk'),
        'unused.png': strToU8('png-bytes'),
      }),
    );
    expect(storedTemplate()).toBeTruthy();
    expect(mediaStorage.blobs.size).toBe(0);
    expect(errorService.error()).toBeNull();
  });

  it('fails when the zip has no root-level .json', async () => {
    await service.importPack(zipPack({ 'data/game.json': templateEntry(makePack()) }));
    expect(errorText()).toContain('ровно один');
    expect(templateService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('fails when the zip has several root-level .json files', async () => {
    await service.importPack(
      zipPack({
        'game.json': templateEntry(makePack()),
        'another.json': templateEntry(makePack()),
      }),
    );
    expect(errorText()).toContain('ровно один');
    expect(templateService.getAll()).toEqual([]);
  });

  it('fails on unparsable JSON', async () => {
    await service.importPack(zipPack({ 'game.json': strToU8('{oops') }));
    expect(errorText()).toContain('разобрать');
    expect(templateService.getAll()).toEqual([]);
  });

  it('fails when the parsed JSON is not an object', async () => {
    await service.importPack(zipPack({ 'game.json': strToU8('null') }));
    expect(errorText()).toContain('структура');
    expect(templateService.getAll()).toEqual([]);
  });

  it('fails on a structural violation naming the problem', async () => {
    const bad = makePack();
    bad.rounds = [];
    await service.importPack(zipPack({ 'game.json': templateEntry(bad) }));
    expect(errorText()).toContain('раундов');
    expect(templateService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('fails on a type violation citing 1-based indexes, never pack ids', async () => {
    const bad = makePack();
    bad.rounds[0].topics[0].questions[0] = {
      ...bad.rounds[0].topics[0].questions[0],
      type: 'MYSTERY' as QuestionTypes,
    };
    await service.importPack(zipPack({ 'game.json': templateEntry(bad) }));
    expect(errorText()).toBe('Неизвестный тип вопроса 1 в теме 1 раунда 1 в файле-конфигурации');
    expect(templateService.getAll()).toEqual([]);
  });

  it('blocks a pack whose media ref is absent from the zip, listing the file', async () => {
    await service.importPack(
      zipPack({
        'game.json': templateEntry(makePackWithMedia()),
        'a.png': strToU8('png-bytes'),
        'media/b.png': strToU8('png-bytes'),
        'media/c.mp3': strToU8('mp3-bytes'),
      }),
    );
    expect(errorText()).toContain('Отсутствуют файлы в архиве: d.png');
    expect(templateService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('rejects refs escaping the zip root', async () => {
    const bad = makePack();
    bad.images = ['../evil.png', '/abs.png'];
    await service.importPack(zipPack({ 'game.json': templateEntry(bad) }));
    expect(errorText()).toContain('за пределы архива: ../evil.png, /abs.png');
    expect(templateService.getAll()).toEqual([]);
  });

  it('fails on a corrupt zip, naming the template', async () => {
    await service.importPack(new File([strToU8('definitely not a zip')], 'pack.zip'));
    expect(errorText()).toBe('Не удалось распаковать архив с шаблоном игры');
    expect(templateService.getAll()).toEqual([]);
  });

  it('rejects a name clash with the standard balloon: no navigation, storage unchanged', async () => {
    templateService.create(makeGameTemplate('t-1', 'TestGame 1'));
    await service.importPack(zipPack({ 'game.json': templateEntry(makePack()) }));
    expect(errorText()).toBe('Шаблон игры с названием «TestGame 1» уже существует');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(templateService.getAll().length).toBe(1);
  });

  it('compares names trimmed + case-insensitively', async () => {
    templateService.create(makeGameTemplate('t-1', 'testgame 1 '));
    await service.importPack(zipPack({ 'game.json': templateEntry(makePack()) }));
    expect(errorText()).toBe('Шаблон игры с названием «TestGame 1» уже существует');
    expect(templateService.getAll().length).toBe(1);
  });

  it('rejects a name clash before any media byte is written', async () => {
    templateService.create(makeGameTemplate('t-1', 'TestGame 1'));
    const put = vi.spyOn(mediaStorage, 'put');
    await service.importPack(makeMediaPack());
    expect(put).not.toHaveBeenCalled();
    expect(mediaStorage.blobs.size).toBe(0);
    expect(templateService.getAll().length).toBe(1);
  });

  it('rolls back all media writes on quota failure and rejects atomically', async () => {
    const realPut = mediaStorage.put.bind(mediaStorage);
    vi.spyOn(mediaStorage, 'put').mockImplementation(async (id, path, blob) => {
      if (path === 'media/c.mp3') {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      }
      return realPut(id, path, blob);
    });
    await service.importPack(makeMediaPack());
    expect(errorText()).toContain('Недостаточно места для сохранения шаблона игры');
    expect(errorText()).toContain('Удалите старые шаблоны');
    expect(templateService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
    // IndexedDB left with no trace of the template: partial writes rolled back.
    expect(mediaStorage.blobs.size).toBe(0);
  });

  it('requests persist() exactly once, after the first fully successful import', async () => {
    const persist = vi.fn(async () => true);
    Object.defineProperty(navigator, 'storage', { value: { persist }, configurable: true });

    await service.importPack(zipPack({ 'game.json': strToU8('{oops') }));
    expect(persist).not.toHaveBeenCalled();

    await service.importPack(makeMediaPack());
    expect(persist).toHaveBeenCalledTimes(1);

    await service.importPack(makeMediaPack()); // now a name-clash reject
    expect(persist).toHaveBeenCalledTimes(1);
  });
});
