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

**Status:** done

- [x] MediaStorage interface exists with exactly `put`/`get`/`deleteGame` and
      `"<gameId>/<path>"` keys; IdbMediaStorage implements it and import uses it via DI
- [x] Importing a pack stores every media file; the stored Game JSON remains
      author-verbatim (refs unchanged, no hashes/manifest)
- [x] Id-clash reject happens before any media byte is written (unit test asserts ordering)
- [x] Quota failure rolls back all partial writes (IndexedDB left with no trace of the Game)
      and shows the «Недостаточно места…» balloon; import is rejected atomically
- [x] `persist()` requested exactly once across imports (a flag prevents re-asking), after
      the first fully successful import
- [x] Deleting a Game from the saved-games list removes its media folder too (unit test;
      manual check via browser DevTools)
- [x] Unit tests run against a fake/indexedDB-backed store without a browser backend

## Comments

- The seam lives in `_services/media/media-storage.ts`: the `MediaStorage` interface plus a
  `MEDIA_STORAGE` InjectionToken. `IdbMediaStorage`
  (`_services/media/idb-media-storage.ts`) is `@Service({ autoProvided: false })` and is
  bound to the token in `app.config.ts` (`{ provide: MEDIA_STORAGE, useClass:
  IdbMediaStorage }`) — a future S3 backend swaps in at that one line, and nothing can
  inject the concrete class accidentally.
- IdbMediaStorage opens the single store lazily (`our-game-media` v1, one object store, no
  keyPath), one transaction per operation; `deleteGame` uses the prefix range
  `bound("<gameId>/", "<gameId>/\uffff", false, true)`. The request is issued synchronously
  in the same task that created the transaction, so it cannot auto-commit early.
- Media-ref utilities (`collectMediaRefs`, `checkMediaRefs`, `escapesZipRoot`) moved from
  game-import.service.ts to `_services/media/media-refs.ts` — ticket 04's playback will
  resolve refs through the same collector; no behavior change.
- Pipeline order is now: unzip → single root `.json` → parse → validate → media-ref check →
  id-clash pre-check (`gameService.getById`, verbatim balloon; `create()` still re-checks) →
  `put` every referenced zip file (deduped via `Set`) → `create()` → navigate → persist. Only
  *referenced* files are stored — junk is never written, so rollback scope is exactly the
  Game's folder.
- Quota failure: any `put` rejection triggers `deleteGame(game.id)` (awaited, best-effort)
  and the balloon «Недостаточно места для сохранения игры. Удалите старые игры и попробуйте
  снова.» — no Game entry, no leftover media. No `estimate()` pre-flight, per spec.
- `navigator.storage?.persist?.()` is fire-and-forget (errors swallowed), guarded by a
  `persistRequested` flag on the root-provided import service — once per session, after the
  first fully successful import (validation failure and id-clash reject do not ask).
- Deleting a Game in `GameList` now also fires `mediaStorage.deleteGame(gameId)`
  (best-effort). Wired at the component, per spec §5's list-level phrasing; `GameService`
  stays a pure localStorage CRUD service.
- Testing without a browser backend: `IdbMediaStorage` spec runs on `fake-indexeddb` with
  Node `Blob` values (probed: fake-indexeddb clones via the global `structuredClone`, which
  serializes Node Blobs correctly but turns jsdom Blobs into plain objects, losing methods).
  The import and game-list specs use a new in-memory `FakeMediaStorage` (`src/testing/`),
  so jsdom Blobs are never structured-cloned. `tsconfig.spec.json` gained `"types": ["node"]`
  for the `node:buffer` import.
- Suite: 84 passed (was 73): 5 IdbMediaStorage tests, +4 import tests (media stored verbatim,
  clash-before-write ordering via `put` spy, quota rollback, persist-once), +2 game-list
  tests (delete removes media folder; other games keep theirs). Production build green.
- Left for the user (per ticket): the DevTools check — import a real pack, verify the
  `our-game-media` DB keys look like `1/media/x.png`, delete the game on the list, watch the
  folder vanish; and the one-time `persist()` prompt in a browser that prompts. Ticket 06's
  manual smoke round-trip covers this end to end.
