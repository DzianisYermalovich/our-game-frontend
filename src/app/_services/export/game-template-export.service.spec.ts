import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { strToU8, unzipSync } from 'fflate';
import { GameTemplateExportService } from './game-template-export.service';
import { GameImportService } from '../import/game-import.service';
import { GameTemplateService } from '../data/local-storage/game-template.service';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { FakeMediaStorage } from '../../../testing/fake-media-storage';
import { makeGameTemplate } from '../../../testing/game-fixture';
import { GameTemplate } from '../../_models/game-template';

/** The fixture template plus media refs, and the bytes each ref must hold. */
function makeTemplateWithMedia(): GameTemplate {
  const template = makeGameTemplate();
  template.images = ['a.png'];
  template.rounds[0].topics[0].questions[0].image = ['media/b.png'];
  template.rounds[0].topics[0].questions[0].sound = 'media/c.mp3';
  template.superRound.questions[0].answerImage = 'd.png';
  return template;
}

function mediaBytes(): Record<string, string> {
  return {
    'a.png': 'png-bytes',
    'media/b.png': 'png-bytes',
    'media/c.mp3': 'mp3-bytes',
    'd.png': 'png-bytes',
  };
}

describe('GameTemplateExportService', () => {
  let service: GameTemplateExportService;
  let importService: GameImportService;
  let templateService: GameTemplateService;
  let errorService: BalloonErrorService;
  let mediaStorage: FakeMediaStorage;
  let router: Router;
  let downloads: { name: string; blob: Blob }[];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MEDIA_STORAGE, useClass: FakeMediaStorage }],
    });
    service = TestBed.inject(GameTemplateExportService);
    importService = TestBed.inject(GameImportService);
    templateService = TestBed.inject(GameTemplateService);
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

  it('writes the stored template verbatim as the single root-level game.json', async () => {
    const template = makeTemplateWithMedia();
    await service.exportTemplate(template);

    const entries = await unzipDownload();
    expect(Object.keys(entries).filter((n) => n.toLowerCase().endsWith('.json'))).toEqual([
      'game.json',
    ]);
    // Verbatim: uuid ids, author shape, no roster — nothing to strip.
    expect(JSON.parse(new TextDecoder().decode(entries['game.json']))).toEqual(template);
  });

  it('downloads as «<template name>.zip»', async () => {
    await service.exportTemplate(makeTemplateWithMedia());
    expect(downloads[0].name).toBe('Test game template.zip');
  });

  it('puts media at their referenced zip-root-relative paths', async () => {
    const template = makeTemplateWithMedia();
    for (const [ref, bytes] of Object.entries(mediaBytes())) {
      await mediaStorage.put(template.id!, ref, new Blob([strToU8(bytes)]));
    }
    await service.exportTemplate(template);

    const entries = await unzipDownload();
    expect(Object.keys(entries)).toContain('media/b.png');
    expect(Array.from(entries['media/b.png'])).toEqual(Array.from(strToU8('png-bytes')));
    expect(Array.from(entries['media/c.mp3'])).toEqual(Array.from(strToU8('mp3-bytes')));
  });

  it('skips missing media with a warning balloon and still exports', async () => {
    const template = makeTemplateWithMedia();
    await mediaStorage.put(template.id!, 'media/c.mp3', new Blob([strToU8('mp3-bytes')]));

    await service.exportTemplate(template);

    expect(errorService.error()?.description).toContain('Отсутствуют файлы мультимедиа');
    expect(errorService.error()?.description).toContain('a.png, media/b.png, d.png');
    const entries = await unzipDownload();
    expect(Object.keys(entries)).toEqual(['game.json', 'media/c.mp3']);
    expect(Array.from(entries['media/c.mp3'])).toEqual(Array.from(strToU8('mp3-bytes')));
  });

  it('exports a template with no stored media as a JSON-only zip', async () => {
    await service.exportTemplate(makeGameTemplate());

    expect(errorService.error()).toBeNull();
    expect(Object.keys(await unzipDownload())).toEqual(['game.json']);
  });

  it('re-importing the exported zip into the same browser trips the name-conflict reject', async () => {
    // Round-trip story (spec §8): import(export(t)) is content-identical with
    // fresh ids, so identity = name always rejects in the same browser.
    const template = makeTemplateWithMedia();
    templateService.create(template);
    for (const [ref, bytes] of Object.entries(mediaBytes())) {
      await mediaStorage.put(template.id!, ref, new Blob([strToU8(bytes)]));
    }

    await service.exportTemplate(template);
    expect(errorService.error()).toBeNull();
    expect(downloads[0].name).toBe('Test game template.zip');

    await importService.importPack(
      new File([new Uint8Array(await downloads[0].blob.arrayBuffer())], 'export.zip'),
    );

    expect(errorService.error()?.description).toBe(
      'Шаблон игры с названием «Test game template» уже существует',
    );
    expect(router.navigate).not.toHaveBeenCalled();
    // The stored template is untouched: one entry, original id.
    expect(templateService.getAll().length).toBe(1);
    expect(templateService.getAll()[0]!.id).toBe(template.id);
  });

  it('sanitizes filesystem-unsafe characters in the download name', async () => {
    const template = makeGameTemplate('t-1', 'Шаблон: "ЧП"? / больш < тест | раз');
    await service.exportTemplate(template);
    expect(downloads[0].name).toBe('Шаблон_ _ЧП__ _ больш _ тест _ раз.zip');
  });

  it('falls back to «шаблон» when the name sanitizes to nothing', async () => {
    await service.exportTemplate(makeGameTemplate('t-1', '...'));
    expect(downloads[0].name).toBe('шаблон.zip');
  });
});
