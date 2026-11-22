import { InjectionToken } from '@angular/core';

/**
 * Browser-side storage for imported GameTemplate media (ADR 0002 + the
 * template/instance split, ADR 0004): media belongs to a GameTemplate.
 * Keys are S3-style "<templateId>/<path>" — one folder per template, `path`
 * exactly the author's zip-root-relative ref, so the stored template JSON
 * stays author-verbatim (no hashes, no manifest, no mapping). A future
 * S3-backed implementation slots in behind the same interface.
 */
export interface MediaStorage {
  put(id: string, path: string, blob: Blob): Promise<void>;
  get(id: string, path: string): Promise<Blob | undefined>;
  deleteAll(id: string): Promise<void>;
}

/** DI seam for the storage backend; app.config binds it to IdbMediaStorage. */
export const MEDIA_STORAGE = new InjectionToken<MediaStorage>('MEDIA_STORAGE');
