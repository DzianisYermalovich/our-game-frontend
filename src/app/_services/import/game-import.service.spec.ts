import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { strToU8, zipSync } from 'fflate';
import { GameImportService } from './game-import.service';
import { GameService } from '../data/local-storage/game.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { makeValidGame } from '../../../testing/game-fixture';
import { Game } from '../../_models/game';
import { QuestionTypes } from '../../_enums/question-types.enum';

type ZipContents = Record<string, Uint8Array>;

/** Packs the given files (bytes or strings) into a zip File. */
function zipPack(contents: ZipContents): File {
  return new File([zipSync(contents)], 'pack.zip', { type: 'application/zip' });
}

function gameEntry(game: unknown): Uint8Array {
  return strToU8(JSON.stringify(game));
}

/** The fixture Game plus media refs that must all resolve inside the pack. */
function makeGameWithMedia(): Game {
  const game = makeValidGame();
  game.images = ['a.png'];
  game.rounds[0].topics[0].questions[0].image = ['media/b.png'];
  game.rounds[0].topics[0].questions[0].sound = 'media/c.mp3';
  game.superRound.questions[0].answerImage = 'd.png';
  return game;
}

/** A pack whose every media ref resolves. */
function makeMediaPack(): File {
  return zipPack({
    'game.json': gameEntry(makeGameWithMedia()),
    'a.png': strToU8('png-bytes'),
    'media/b.png': strToU8('png-bytes'),
    'media/c.mp3': strToU8('mp3-bytes'),
    'd.png': strToU8('png-bytes'),
  });
}

describe('GameImportService', () => {
  let service: GameImportService;
  let gameService: GameService;
  let errorService: BalloonErrorService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(GameImportService);
    gameService = TestBed.inject(GameService);
    errorService = TestBed.inject(BalloonErrorService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function errorText(): string | undefined {
    return errorService.error()?.description;
  }

  it('imports a valid pack: game stored, user navigated to it, no balloon', async () => {
    await service.importPack(makeMediaPack());
    expect(gameService.getById('1')).toEqual(makeGameWithMedia());
    expect(router.navigate).toHaveBeenCalledWith(['game', '1']);
    expect(errorService.error()).toBeNull();
  });

  it('unreferenced junk files do not block import', async () => {
    await service.importPack(
      zipPack({
        'game.json': gameEntry(makeValidGame()),
        '.DS_Store': strToU8('junk'),
        '__MACOSX/._game.json': strToU8('junk'),
        'unused.png': strToU8('png-bytes'),
      }),
    );
    expect(gameService.getById('1')).toBeTruthy();
    expect(errorService.error()).toBeNull();
  });

  it('fails when the zip has no root-level .json', async () => {
    await service.importPack(zipPack({ 'data/game.json': gameEntry(makeValidGame()) }));
    expect(errorText()).toContain('ровно один');
    expect(gameService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('fails when the zip has several root-level .json files', async () => {
    await service.importPack(
      zipPack({
        'game.json': gameEntry(makeValidGame()),
        'another.json': gameEntry(makeValidGame('2')),
      }),
    );
    expect(errorText()).toContain('ровно один');
    expect(gameService.getAll()).toEqual([]);
  });

  it('fails on unparsable JSON', async () => {
    await service.importPack(zipPack({ 'game.json': strToU8('{oops') }));
    expect(errorText()).toContain('разобрать');
    expect(gameService.getAll()).toEqual([]);
  });

  it('fails when the parsed JSON is not an object', async () => {
    await service.importPack(zipPack({ 'game.json': strToU8('null') }));
    expect(errorText()).toContain('структура');
    expect(gameService.getAll()).toEqual([]);
  });

  it('fails on a structural violation naming the problem', async () => {
    const bad = makeValidGame();
    bad.rounds = [];
    await service.importPack(zipPack({ 'game.json': gameEntry(bad) }));
    expect(errorText()).toContain('раундов');
    expect(gameService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('fails on a type violation naming the question', async () => {
    const bad = makeValidGame();
    bad.rounds[0].topics[0].questions[0] = {
      ...bad.rounds[0].topics[0].questions[0],
      type: 'MYSTERY' as QuestionTypes,
    };
    await service.importPack(zipPack({ 'game.json': gameEntry(bad) }));
    expect(errorText()).toContain('Неизвестный тип вопроса');
    expect(gameService.getAll()).toEqual([]);
  });

  it('blocks a pack whose media ref is absent from the zip, listing the file', async () => {
    await service.importPack(
      zipPack({
        'game.json': gameEntry(makeGameWithMedia()),
        'a.png': strToU8('png-bytes'),
        'media/b.png': strToU8('png-bytes'),
        'media/c.mp3': strToU8('mp3-bytes'),
      }),
    );
    expect(errorText()).toContain('Отсутствуют файлы в архиве: d.png');
    expect(gameService.getAll()).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('rejects refs escaping the zip root', async () => {
    const bad = makeValidGame();
    bad.images = ['../evil.png', '/abs.png'];
    await service.importPack(zipPack({ 'game.json': gameEntry(bad) }));
    expect(errorText()).toContain('за пределы архива: ../evil.png, /abs.png');
    expect(gameService.getAll()).toEqual([]);
  });

  it('fails on a corrupt zip', async () => {
    await service.importPack(new File([strToU8('definitely not a zip')], 'pack.zip'));
    expect(errorText()).toContain('распаковать');
    expect(gameService.getAll()).toEqual([]);
  });

  it('rejects an id clash verbatim: no navigation, storage unchanged', async () => {
    gameService.create(makeValidGame());
    await service.importPack(zipPack({ 'game.json': gameEntry(makeValidGame()) }));
    expect(errorText()).toBe('Игра с Id 1 уже существует');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(gameService.getAll().length).toBe(1);
  });
});
