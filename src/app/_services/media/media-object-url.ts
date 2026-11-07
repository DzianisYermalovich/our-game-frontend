import { effect, inject, signal, Signal } from '@angular/core';
import { MEDIA_STORAGE } from './media-storage';

/**
 * Resolves a Game media ref to a blob object URL signal (spec §5 runtime).
 * Must be called in an injection context: it registers an effect that reads
 * the ref through MediaStorage.get(), stores the Blob's object URL in the
 * returned signal (the async callback writes a signal, so zoneless change
 * detection is scheduled), and revokes the URL via effect(onCleanup) when
 * the inputs change or the enclosing scope is destroyed — no leak when
 * navigating between questions. A ref with no stored blob degrades quietly:
 * the signal stays undefined — hidden media, no error balloon, no fallback
 * to `/assets` paths.
 */
export function mediaObjectUrl(
  gameId: () => string,
  ref: () => string,
): Signal<string | undefined> {
  const mediaStorage = inject(MEDIA_STORAGE);
  const url = signal<string | undefined>(undefined);

  effect((onCleanup) => {
    const id = gameId();
    const path = ref();
    if (!id || !path) {
      return;
    }
    let created: string | undefined;
    let disposed = false;
    // get() resolves undefined for a missing ref — hide the media, don't error.
    void mediaStorage
      .get(id, path)
      .then((blob) => {
        if (disposed || !blob) {
          return;
        }
        created = URL.createObjectURL(blob);
        url.set(created);
      })
      .catch(() => {});
    onCleanup(() => {
      disposed = true;
      if (created) {
        URL.revokeObjectURL(created);
        url.set(undefined);
      }
    });
  });

  return url.asReadonly();
}
