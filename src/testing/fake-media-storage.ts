import { MediaStorage } from '../app/_services/media/media-storage';

/**
 * In-memory MediaStorage for tests: keeps Blobs in a Map keyed
 * "<templateId>/<path>", mirroring the real key scheme. No IndexedDB, no
 * structured cloning — jsdom Blobs go straight into the Map. Specs inject
 * failures (e.g. quota exhaustion) by spying on `put`.
 */
export class FakeMediaStorage implements MediaStorage {
  public readonly blobs = new Map<string, Blob>();

  public async put(id: string, path: string, blob: Blob): Promise<void> {
    this.blobs.set(`${id}/${path}`, blob);
  }

  public async get(id: string, path: string): Promise<Blob | undefined> {
    return this.blobs.get(`${id}/${path}`);
  }

  public async deleteAll(id: string): Promise<void> {
    const prefix = `${id}/`;
    for (const key of [...this.blobs.keys()]) {
      if (key.startsWith(prefix)) {
        this.blobs.delete(key);
      }
    }
  }
}
