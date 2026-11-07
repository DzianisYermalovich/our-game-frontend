import { Service } from '@angular/core';
import { MediaStorage } from './media-storage';

const DB_NAME = 'our-game-media';
const DB_VERSION = 1;
const STORE_NAME = 'media';

/**
 * v1 MediaStorage (spec §5, ADR 0002): one IndexedDB object store, string
 * keys "<gameId>/<path>", Blob values via structured clone, prefix-range
 * delete per Game. Not auto-provided: it is bound to MEDIA_STORAGE in
 * app.config, so a future backend swaps in behind the same interface.
 */
@Service({ autoProvided: false })
export class IdbMediaStorage implements MediaStorage {
  private db?: Promise<IDBDatabase>;

  public async put(gameId: string, path: string, blob: Blob): Promise<void> {
    const store = await this.store('readwrite');
    await asPromise(store.put(blob, mediaKey(gameId, path)));
  }

  public async get(gameId: string, path: string): Promise<Blob | undefined> {
    const store = await this.store('readonly');
    return asPromise<Blob | undefined>(store.get(mediaKey(gameId, path)));
  }

  public async deleteGame(gameId: string): Promise<void> {
    // The "gameId/…" range covers exactly this Game's folder.
    const range = IDBKeyRange.bound(`${gameId}/`, `${gameId}/\uffff`, false, true);
    const store = await this.store('readwrite');
    await asPromise(store.delete(range));
  }

  /**
   * Opens the object store inside a fresh transaction and resolves the
   * single request made against it. The request is issued synchronously
   * in the same task that created the transaction, so the transaction
   * cannot auto-commit before the request lands.
   */
  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.open();
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  }

  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      const open = indexedDB.open(DB_NAME, DB_VERSION);
      open.onupgradeneeded = () => open.result.createObjectStore(STORE_NAME);
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error ?? new Error('Не удалось открыть хранилище медиа'));
    });
    return this.db;
  }
}

function mediaKey(gameId: string, path: string): string {
  return `${gameId}/${path}`;
}

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Ошибка хранилища медиа'));
  });
}
