# Spec: Game content import

Locked 2026-11-02 from wayfinder tickets 01–06 (see [map.md](map.md)). Vocabulary: root
GLOSSARY.md (**Game import**, **Game media**, **Game**, **Question**, **BalloonError**).
Architecture records: [ADR 0002](../../docs/adr/0002-media-storage-seam.md) (media storage
seam), [ADR 0003](../../docs/adr/0003-import-only-distribution.md) (import-only
distribution). UI strings stay Russian; docs and tickets stay English.

## 1. Distribution: import-only (ADR 0003)

The app ships no game data. `public/assets/temp/` is deleted entirely (including the unused
Express server files: `index.js`, `package.json`, `run.bat`) and `initGame.json` leaves the
repo (git history keeps it). The fetch flow (`GameService.initGameFromJson()`, HttpClient
for game config) is removed. System sounds (`public/assets/sounds/system/`) stay — app
chrome, not game content.

## 2. Import flow (ticket 02)

- Home's primary button stays **«Новая игра»**, same spot beside «Продолжить игру».
- Click → hidden `<input type="file">` → native picker accepts a single `.zip`. Cancel is a
  silent no-op.
- Pipeline: unzip (fflate) → find the single root-level `.json` → `JSON.parse` → validate →
  pre-check id clash → store media → create Game → navigate `/game/<id>`.
- Success feedback is the game screen itself — no toast, no detour through the list.
- Every failure (unparsable JSON, structural, type, missing media, quota) surfaces as a
  **BalloonError**; Russian messages keep naming the offending round/topic/question or
  listing the missing media files.

## 3. Validation — what "valid" means (ticket 02)

One shared validator, extracted from `GameService`'s private `isGameValid` so import and
GameService cannot drift. Three layers:

1. **Structural** (today's checks, verbatim): counts vs `settings` (rounds, topics per
   round, questions per topic, super-round questions) and non-zero `minPrice`.
2. **Light field/type checks**: required fields present and typed — `id`/`name` strings,
   `author` object, `players`/`rounds`/`images` arrays, `question.text`/`answer` strings,
   `question.type` a known QuestionType.
3. **Media presence**: every zip-root-relative ref in `image`/`sound`/`answerImage`
   resolves to a file inside the zip, or the import is blocked with a balloon listing the
   missing files. Refs escaping the zip root are rejected. Unreferenced zip files
   (`__MACOSX`, `.DS_Store`, …) are ignored. Media MIME types are not policed — the
   browser degrades at render.

## 4. Conflict policy (ticket 03)

Id clash → today's reject verbatim: BalloonError «Игра с Id N уже существует», no
navigation, no changes to `create()`. The clash pre-check runs **before any media bytes
are written** (a reject has nothing to roll back). Legacy id-"1" Games: no migration, no
special-casing — they are ordinary entries. The id stays user-meaningful; the list display
(`ID:{{ game.id }}`) is unchanged.

## 5. Media storage (tickets 04–05; ADR 0002)

- **`MediaStorage` interface**: `put(gameId, path, blob)`, `get(gameId, path)`,
  `deleteGame(gameId)`. Keys are S3-style `"<gameId>/<path>"` — a folder per Game; `path`
  is exactly the author's zip-root-relative ref. A future S3-backed implementation slots in
  behind the same interface.
- **v1 implementation `IdbMediaStorage`**: one IndexedDB object store, string keys, Blob
  values (structured clone), prefix delete per Game.
- The stored Game JSON stays **author-verbatim** — no hashes, no manifest, no mapping.
- **Import writes**: `put()` each zip media file; on quota failure `deleteGame(game.id)`
  rolls back partial writes and the import is atomically rejected (balloon «Недостаточно
  места…», hinting to delete old games). No `estimate()` pre-flight.
  `navigator.storage.persist()` is called once after the first successful import.
- **Deletion wiring**: removing a Game from the list must also `deleteGame(gameId)` — media
  never outlives its Game.
- **Runtime**: `get()` → Blob read once into a signal → blob object URL bound to
  `<img>`/`<audio>` via `effect(onCleanup)`; missing refs degrade quietly (hidden media,
  alt text). No fallback to `/assets` paths. Async callbacks write signals to schedule
  zoneless change detection.

## 6. Export / backup (ticket 06)

- An **«Экспортировать»** button on each saved-games list row, beside «Продолжить игру» /
  «Удалить». Download-dialog cancel is a silent no-op.
- Produces an **import-format zip**: `game.json` at the root (stored Game verbatim) +
  media at their referenced paths (same fflate dep). Downloaded as `<game name>.zip`
  (filesystem-unsafe characters sanitized).
- **Round-trip guarantee: semantic identity** — same id, same refs, same media bytes —
  **not** byte-identical JSON (the localStorage write path normalizes formatting). Tests
  assert semantics, never bytes.
- **Missing media: skip + warn, never block** — unresolvable refs are skipped with a
  balloon warning; a legacy Game exports as JSON-only.
- Role: export is the **manual backup** against browser-storage loss (Safari 7-day wipe,
  LRU pressure, cleared site data). `persist()` is the only automatic guardrail; no
  scheduled backups in v1. Same-browser re-import trips the ticket-03 id-clash reject —
  expected: export targets backup and transfer.

## 7. Out of scope

Implementing this spec is the follow-on effort (to-tickets → implement). Also out: changes
to system sounds, hosting/deployment redesign, e2e tests, multiplayer, question-authoring
tooling, drag-and-drop import, `estimate()` pre-flight, the File System Access quota escape
(deferred indefinitely), scheduled/auto backups, export from inside the active game, and
saved-games list redesign.

## Verification sketch (input for the implementation effort)

- **Unit**: validator layers; zip layout rules (exactly one root-level `.json`; root-escape
  refs rejected); id-clash pre-check ordering (reject before any media write); rollback on
  quota failure; export zip shape; semantic round-trip (export → import equivalence on a
  fixture Game).
- **Manual smoke**: import a historical-style pack (bare filename refs) → play rounds with
  media → export → clear site data → re-import → play again. Legacy game still listed with
  dead refs degrading quietly. `persist()` prompt appears once on first import in browsers
  that prompt.
