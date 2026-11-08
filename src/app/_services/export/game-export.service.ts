import { Service, inject } from '@angular/core';
import { Unzipped, zipSync, strToU8 } from 'fflate';
import { Game } from '../../_models/game';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { collectMediaRefs } from '../media/media-refs';

/**
 * Exports a saved Game as an import-format zip (spec §6): `game.json` at the
 * root (the stored Game verbatim) plus every referenced media file at its
 * zip-root-relative path, downloaded as `<game name>.zip`. The manual backup
 * against browser-storage loss (Safari 7-day wipe, LRU pressure, cleared
 * site data); `persist()` remains the only automatic guardrail. Missing
 * media is skip + warn, never block: unresolvable refs are listed in a
 * balloon and the export succeeds without them; a legacy Game with no
 * stored media exports as a JSON-only zip. Round-trip guarantee is semantic
 * identity (same id, refs, media bytes), not byte-identical JSON — a
 * same-browser re-import trips the import id-clash reject, by design.
 */
@Service()
export class GameExportService {
  private readonly mediaStorage = inject(MEDIA_STORAGE);
  private readonly errorService = inject(BalloonErrorService);

  public async exportGame(game: Game): Promise<void> {
    const entries: Unzipped = { 'game.json': strToU8(JSON.stringify(game)) };
    const missing: string[] = [];
    for (const ref of new Set(collectMediaRefs(game))) {
      const blob = await this.mediaStorage.get(game.id, ref);
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
    this.download(new Blob([zipSync(entries)], { type: 'application/zip' }), game.name);
  }

  /** Clicks a temporary anchor; a cancelled download dialog is a silent no-op. */
  private download(blob: Blob, gameName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sanitizeFileName(gameName)}.zip`;
    anchor.click();
    // Revoked on the next macrotask: the click's fetch of the blob URL has started.
    setTimeout(() => URL.revokeObjectURL(url));
  }
}

/**
 * The zip download name: Windows-forbidden characters (< > : " / \ | ? * and
 * control chars) become underscores, trailing dots/spaces are dropped, and a
 * name that sanitizes to nothing falls back to «игра».
 */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/[. ]+$/, '')
    .trim();
  return cleaned || 'игра';
}
