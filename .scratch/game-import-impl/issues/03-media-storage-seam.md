# 03: Media storage behind the seam

**What to build:** Imported media persists browser-side behind the MediaStorage interface
(spec §5, ADR 0002): `put(gameId, path, blob)`, `get(gameId, path)`, `deleteGame(gameId)` with
S3-style keys `"<gameId>/<path>"` — one folder per Game, `path` exactly the author's
zip-root-relative ref, so the stored Game JSON stays author-verbatim (no hashes, no manifest,
no mapping). v1 implementation `IdbMediaStorage`: one IndexedDB object store, string keys,
Blob values via structured clone, prefix-range delete per Game. Import now writes every media
file before creating the Game; the id-clash pre-check still runs before any media bytes are
written so a reject has nothing to roll back. Quota failure rolls back partial writes with
`deleteGame()` and rejects atomically with the balloon «Недостаточно места…» hinting to
delete old games; no `estimate()` pre-flight. `navigator.storage.persist()` is called once
after the first successful import. Deleting a Game from the saved-games list also deletes its
media — media never outlives its Game. A future S3-backed implementation must slot in behind
the same interface.

**Blocked by:** 02 (Zip import pipeline).

**Status:** ready-for-agent

- [ ] MediaStorage interface exists with exactly `put`/`get`/`deleteGame` and
      `"<gameId>/<path>"` keys; IdbMediaStorage implements it and import uses it via DI
- [ ] Importing a pack stores every media file; the stored Game JSON remains
      author-verbatim (refs unchanged, no hashes/manifest)
- [ ] Id-clash reject happens before any media byte is written (unit test asserts ordering)
- [ ] Quota failure rolls back all partial writes (IndexedDB left with no trace of the Game)
      and shows the «Недостаточно места…» balloon; import is rejected atomically
- [ ] `persist()` requested exactly once across imports (a flag prevents re-asking), after
      the first fully successful import
- [ ] Deleting a Game from the saved-games list removes its media folder too (unit test;
      manual check via browser DevTools)
- [ ] Unit tests run against a fake/indexedDB-backed store without a browser backend
