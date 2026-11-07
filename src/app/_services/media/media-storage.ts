import { InjectionToken } from '@angular/core';

/**
 * Browser-side storage for imported Game media (spec §5, ADR 0002).
 * Keys are S3-style "<gameId>/<path>" — one folder per Game, `path` exactly
 * the author's zip-root-relative ref, so the stored Game JSON stays
 * author-verbatim (no hashes, no manifest, no mapping). A future
 * S3-backed implementation slots in behind the same interface.
 */
export interface MediaStorage {
  put(gameId: string, path: string, blob: Blob): Promise<void>;
  get(gameId: string, path: string): Promise<Blob | undefined>;
  deleteGame(gameId: string): Promise<void>;
}

/** DI seam for the storage backend; app.config binds it to IdbMediaStorage. */
export const MEDIA_STORAGE = new InjectionToken<MediaStorage>('MEDIA_STORAGE');
