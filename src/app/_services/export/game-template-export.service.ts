import { Service, inject } from '@angular/core';
import { Unzipped, zipSync, strToU8 } from 'fflate';
import { GameTemplate } from '../../_models/game-template';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { collectMediaRefs } from '../media/media-refs';
import { sanitizeFileName } from '../../_utils/file-name';

/**
 * Exports a GameTemplate as an import-format zip (spec §8, ticket 06):
 * `game.json` at the root (the stored template verbatim — uuid ids, author
 * shape, no roster: nothing to strip) plus every referenced media file at
 * its zip-root-relative path, read from the template-keyed media folder,
 * downloaded as `<template name>.zip`. Missing media is skip + warn, never
 * block; a template with no stored media exports as a JSON-only zip. Round
 * trip: `import(export(t))` is content-identical to t with fresh ids, so a
 * same-browser re-import always trips the regular name-conflict reject —
 * export exists to share/backup a pack, not to round-trip.
 */
@Service()
export class GameTemplateExportService {
  private readonly mediaStorage = inject(MEDIA_STORAGE);
  private readonly errorService = inject(BalloonErrorService);

  public async exportTemplate(template: GameTemplate): Promise<void> {
    const entries: Unzipped = { 'game.json': strToU8(JSON.stringify(template)) };
    const missing: string[] = [];
    for (const ref of new Set(collectMediaRefs(template))) {
      const blob = await this.mediaStorage.get(template.id!, ref);
      if (!blob) {
        missing.push(ref);
        continue;
      }
      entries[ref] = new Uint8Array(await blob.arrayBuffer());
    }
    if (missing.length > 0) {
      this.errorService.raise(
        `Отсутствуют файлы мультимедиа, экспортированы без них: ${missing.join(', ')}`,
      );
    }
    this.download(new Blob([zipSync(entries)], { type: 'application/zip' }), template.name);
  }

  /** Clicks a temporary anchor; a cancelled download dialog is a silent no-op. */
  private download(blob: Blob, templateName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sanitizeFileName(templateName, 'шаблон')}.zip`;
    anchor.click();
    // Revoked on the next macrotask: the click's fetch of the blob URL has started.
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
