import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { Blob as NodeBlob } from 'node:buffer';
import { IdbMediaStorage } from './idb-media-storage';

/**
 * Runs against fake-indexeddb (jsdom has no IndexedDB backend). Values are
 * Node Blobs: fake-indexeddb clones via the global structuredClone, which
 * serializes Node Blobs but not jsdom ones.
 */
describe('IdbMediaStorage', () => {
  let storage: IdbMediaStorage;

  beforeEach(() => {
    (globalThis as { indexedDB?: unknown }).indexedDB = new IDBFactory();
    storage = new IdbMediaStorage();
  });

  /** Node Blob passed as the DOM Blob the interface declares. */
  function blob(content: string): Blob {
    return new NodeBlob([content]) as unknown as Blob;
  }

  async function text(blobValue: Blob | undefined): Promise<string | undefined> {
    return (await blobValue?.text()) ?? undefined;
  }

  it('round-trips put/get with "<gameId>/<path>" keys', async () => {
    await storage.put('1', 'media/b.png', blob('png-bytes'));
    expect(await text(await storage.get('1', 'media/b.png'))).toBe('png-bytes');
  });

  it('isolates Games: same path in another folder or game reads empty', async () => {
    await storage.put('1', 'media/b.png', blob('png-bytes'));
    expect(await storage.get('1', 'b.png')).toBeUndefined();
    expect(await storage.get('2', 'media/b.png')).toBeUndefined();
  });

  it('put overwrites an existing key', async () => {
    await storage.put('1', 'a.png', blob('old'));
    await storage.put('1', 'a.png', blob('new'));
    expect(await text(await storage.get('1', 'a.png'))).toBe('new');
  });

  it('deleteGame wipes the whole game folder and nothing else', async () => {
    await storage.put('1', 'a.png', blob('a'));
    await storage.put('1', 'media/b.png', blob('b'));
    await storage.put('2', 'a.png', blob('a2'));

    await storage.deleteGame('1');

    expect(await storage.get('1', 'a.png')).toBeUndefined();
    expect(await storage.get('1', 'media/b.png')).toBeUndefined();
    expect(await text(await storage.get('2', 'a.png'))).toBe('a2');
  });

  it('missing keys read as undefined, never throw', async () => {
    expect(await storage.get('404', 'nowhere.png')).toBeUndefined();
  });
});
