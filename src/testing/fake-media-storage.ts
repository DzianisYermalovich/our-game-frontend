import { MediaStorage } from '../app/_services/media/media-storage';

/**
 * In-memory MediaStorage for tests: keeps Blobs in a Map keyed
 * "<gameId>/<path>", mirroring the real key scheme. No IndexedDB, no
 * structured cloning — jsdom Blobs go straight into the Map. Specs inject
 * failures (e.g. quota exhaustion) by spying on `put`.
 */
export class FakeMediaStorage implements MediaStorage {
  public readonly blobs = new Map<string, Blob>();

  public async put(gameId: string, path: string, blob: Blob): Promise<void> {
    this.blobs.set(`${gameId}/${path}`, blob);
  }

  public async get(gameId: string, path: string): Promise<Blob | undefined> {
    return this.blobs.get(`${gameId}/${path}`);
  }

  public async deleteGame(gameId: string): Promise<void> {
    const prefix = `${gameId}/`;
    for (const key of [...this.blobs.keys()]) {
      if (key.startsWith(prefix)) {
        this.blobs.delete(key);
      }
    }
  }
}
