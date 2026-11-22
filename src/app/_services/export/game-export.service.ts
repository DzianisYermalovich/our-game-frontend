import { Service, inject } from '@angular/core';
import { Unzipped, zipSync, strToU8 } from 'fflate';
import { Game } from '../../_models/game';
import { BalloonErrorService } from '../errors/balloon-error.service';
import { MEDIA_STORAGE } from '../media/media-storage';
import { collectMediaRefs } from '../media/media-refs';
import { sanitizeFileName } from '../../_utils/file-name';

/**
 * Exports a saved Game as an import-format zip (game-import spec §6):
 * `game.json` at the root (the stored Game verbatim) plus every referenced
 * media file at its zip-root-relative path, downloaded as `<game name>.zip`.
 * The manual backup against browser-storage loss; missing media is skip +
 * warn, never block. TRANSITIONAL (ticket 06/10): under the template/instance
 * split the exportable thing is the GameTemplate — this game-side service and
 * its button retire with the atomic swap (ticket 11).
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
    anchor.download = `${sanitizeFileName(gameName, 'игра')}.zip`;
    anchor.click();
    // Revoked on the next macrotask: the click's fetch of the blob URL has started.
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
