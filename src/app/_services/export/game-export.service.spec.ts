import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { strToU8, unzipSync } from 'fflate';
import { GameExportService } from './game-export.service';
import { GameImportService } from '../import/game-import.service';
import { GameService } from '../data/local-storage/game.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { FakeMediaStorage } from '../../../testing/fake-media-storage';
import { makeValidGame } from '../../../testing/game-fixture';
import { Game } from '../../_models/game';

/** The fixture Game plus media refs, and the bytes each ref must hold. */
function makeGameWithMedia(): Game {
  const game = makeValidGame();
  game.images = ['a.png'];
  game.rounds[0].topics[0].questions[0].image = ['media/b.png'];
  game.rounds[0].topics[0].questions[0].sound = 'media/c.mp3';
  game.superRound.questions[0].answerImage = 'd.png';
  return game;
}

function mediaBytes(): Record<string, string> {
  return { 'a.png': 'png-bytes', 'media/b.png': 'png-bytes', 'media/c.mp3': 'mp3-bytes', 'd.png': 'png-bytes' };
}

describe('GameExportService', () => {
  let service: GameExportService;
  let importService: GameImportService;
  let gameService: GameService;
  let errorService: BalloonErrorService;
  let mediaStorage: FakeMediaStorage;
  let router: Router;
  let downloads: { name: string; blob: Blob }[];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useClass: FakeMediaStorage }],
    });
    service = TestBed.inject(GameExportService);
    importService = TestBed.inject(GameImportService);
    gameService = TestBed.inject(GameService);
    errorService = TestBed.inject(BalloonErrorService);
    mediaStorage = TestBed.inject(MEDIA_STORAGE) as FakeMediaStorage;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // jsdom has no blob URL statics; capture what would be downloaded.
    downloads = [];
    URL.createObjectURL = vi.fn((obj: Blob | MediaSource): string => {
      downloads.push({ name: '', blob: obj as Blob });
      return `blob:export-${downloads.length}`;
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads[downloads.length - 1].name = this.download;
    });
  });

  async function unzipDownload(): Promise<Record<string, Uint8Array>> {
    return unzipSync(new Uint8Array(await downloads[0].blob.arrayBuffer()));
  }

  it('round-trips: the exported zip re-imports to a semantically identical Game', async () => {
    const game = makeGameWithMedia();
    gameService.create(game);
    for (const [ref, bytes] of Object.entries(mediaBytes())) {
      await mediaStorage.put('1', ref, new Blob([strToU8(bytes)]));
    }

    await service.exportGame(game);
    expect(errorService.error()).toBeNull();
    expect(downloads).toHaveLength(1);
    expect(downloads[0].name).toBe('TestGame 1.zip');

    // Fresh browser state: only the exported zip travels over.
    localStorage.clear();
    mediaStorage.blobs.clear();
    await importService.importPack(
      new File([new Uint8Array(await downloads[0].blob.arrayBuffer())], 'export.zip'),
    );

    expect(errorService.error()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['game', '1']);
    // Same id and same Game, compared semantically — never byte-wise.
    expect(gameService.getById('1')).toEqual(game);
    // Same refs, same media bytes.
    expect([...mediaStorage.blobs.keys()].sort()).toEqual(
      Object.keys(mediaBytes()).map((ref) => `1/${ref}`).sort(),
    );
    for (const [ref, bytes] of Object.entries(mediaBytes())) {
      const stored = await mediaStorage.get('1', ref);
      // Array.from: fflate yields Node-realm typed arrays under jsdom — same
      // bytes, different prototype, so compare plain number arrays.
      expect(Array.from(new Uint8Array(await stored!.arrayBuffer()))).toEqual(
        Array.from(strToU8(bytes)),
      );
    }
  });

  it('writes the stored Game verbatim as the single root-level game.json', async () => {
    const game = makeValidGame();
    game.rounds[0].topics[0].questions[0].isAnswered = true; // play-state included
    await service.exportGame(game);

    const entries = await unzipDownload();
    expect(Object.keys(entries).filter((n) => n.toLowerCase().endsWith('.json'))).toEqual([
      'game.json',
    ]);
    expect(JSON.parse(new TextDecoder().decode(entries['game.json']))).toEqual(game);
  });

  it('puts media at their referenced zip-root-relative paths', async () => {
    const game = makeGameWithMedia();
    for (const [ref, bytes] of Object.entries(mediaBytes())) {
      await mediaStorage.put('1', ref, new Blob([strToU8(bytes)]));
    }
    await service.exportGame(game);

    const entries = await unzipDownload();
    expect(Object.keys(entries)).toContain('media/b.png');
    expect(Array.from(entries['media/b.png'])).toEqual(Array.from(strToU8('png-bytes')));
    expect(Array.from(entries['media/c.mp3'])).toEqual(Array.from(strToU8('mp3-bytes')));
  });

  it('skips missing media with a warning balloon and still exports', async () => {
    const game = makeGameWithMedia();
    await mediaStorage.put('1', 'media/c.mp3', new Blob([strToU8('mp3-bytes')]));

    await service.exportGame(game);

    expect(errorService.error()?.description).toContain('Отсутствуют файлы мультимедиа');
    expect(errorService.error()?.description).toContain('a.png, media/b.png, d.png');
    const entries = await unzipDownload();
    expect(Object.keys(entries)).toEqual(['game.json', 'media/c.mp3']);
    expect(Array.from(entries['media/c.mp3'])).toEqual(Array.from(strToU8('mp3-bytes')));
  });

  it('exports a legacy Game with no stored media as a JSON-only zip', async () => {
    await service.exportGame(makeValidGame());

    expect(errorService.error()).toBeNull();
    expect(Object.keys(await unzipDownload())).toEqual(['game.json']);
  });

  it('sanitizes filesystem-unsafe characters in the download name', async () => {
    const game = makeValidGame();
    game.name = 'Игра: "ЧП"? / больш < тест | раз';
    await service.exportGame(game);
    expect(downloads[0].name).toBe('Игра_ _ЧП__ _ больш _ тест _ раз.zip');
  });

  it('drops trailing dots and spaces from the download name', async () => {
    const game = makeValidGame();
    game.name = 'Хвост. ';
    await service.exportGame(game);
    expect(downloads[0].name).toBe('Хвост.zip');
  });

  it('falls back to «игра» when the name sanitizes to nothing', async () => {
    const game = makeValidGame();
    game.name = '...';
    await service.exportGame(game);
    expect(downloads[0].name).toBe('игра.zip');
  });
});
