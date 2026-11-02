# Map: Game content import

## Destination

A locked spec under `.scratch/game-import/spec.md`: Games enter localStorage by user file
import (the app ships no game data; `assets/temp/` gone), per-question media travels with
the imported Game and lives browser-side (mechanism: ADR 0002), and an export/backup story is
decided. Ready to hand to a normal implementation effort.

**Reached 2026-11-02** — all tickets resolved, spec locked (see ticket 07).

## Notes

Domain: Russian "Своя игра" quiz (see root GLOSSARY.md). Tracker ops: docs/agents/issue-tracker.md.
Skills per ticket type: research → research skill; grilling → grilling + domain-modeling;
prototype → prototype skill (spin off from tickets if "how should it look/behave" dominates).

Settled at charting (with maintainer, 2026-11-01):
- Import = user file-picker; the app ships no game data (no bundle seed).
- Media travels with the Game and is stored browser-side (mechanism via tickets).
- Export/backup story decided here.
- `assets/temp/` deleted entirely (incl. the unused Express server files); `initGame.json`
  deleted from the repo (git history keeps it).
- System sounds (`public/assets/sounds/system/`) untouched — app chrome, not game content.
- Docs/tickets in English; UI strings stay Russian.

## Decisions so far

- [Research: where imported game media lives in the browser](issues/01-research-browser-media-storage.md): IndexedDB primary (Blobs, content-hash keys, Game JSON keeps only id refs); `persist()`/`estimate()` guardrails; Chromium-only File System Access handle as quota escape; blob object URLs via `effect(onCleanup)` for templates. Findings on branch `research/browser-media-storage`.
- [Import UX & validation](issues/02-import-ux-and-validation.md): «Новая игра» stays the
  button; native file picker (cancel silent) → parse → validate → straight into
  `/game/<id>`; all failures BalloonError. "Valid" = existing count checks + light field/type
  checks + media presence (missing referenced media **blocks** import), validator extracted
  into a shared function. Artifact shape & reference scheme stay with ticket 04; duplicate-id
  policy stays with ticket 03; drag-and-drop out of scope.
- [Import conflict policy](issues/03-import-conflict-policy.md): keep today's reject
  verbatim (BalloonError «Игра с Id N уже существует», no navigation) — the author fixes
  the JSON id and re-imports. Legacy id-"1" Games untouched; no migration story exists
  (imported and legacy Games are the same shape in the same store). Id stays
  user-meaningful; list display unchanged.
- [Media travel format](issues/04-media-travel-format.md): a single **.zip** via the
  ticket-02 picker flow — one `.json` at the zip root + media; refs are zip-root-relative
  paths (bare filenames by convention, subfolders allowed; historical packs import
  unchanged); unzip with fflate; stored refs stay author-facing forever (hashes internal,
  mapping home = ticket 05); missing refs block import (ticket 02's check over the zip's
  file set); no `/assets` fallback — legacy dead refs degrade gracefully. Export (ticket 06)
  becomes the inverse: re-zip.
- [Media storage mechanism](issues/05-media-storage-mechanism.md): **MediaStorage seam**
  (S3-style keys `"<gameId>/<path>"`, put/get/deleteGame) — maintainer's reframe, recorded
  as ADR [0002](docs/adr/0002-media-storage-seam.md); dissolves the path→hash mapping
  (stored Game JSON stays author-verbatim). v1 = `IdbMediaStorage` (IndexedDB, Blob values,
  prefix delete). Quota failure = atomic reject with `deleteGame()` rollback (no estimate()
  pre-flight, maintainer's call). `persist()` after first import. Runtime: get() → Blob
  signal → blob object URL via `effect(onCleanup)`.
- [Export/backup story](issues/06-export-backup-story.md): «Экспортировать» button on each
  saved-games list row → import-format zip (`game.json` verbatim + media at referenced
  paths, fflate) named `<game name>.zip`. Round-trip guarantees **semantic identity**
  (same id/refs/media bytes), not byte-identical JSON. Missing media = skip + warn, never
  block (legacy Games export JSON-only). Export is the manual backup; `persist()` is the
  only automatic guardrail; same-browser re-import trips the ticket-03 reject (expected).
- [Assemble the locked spec](issues/07-assemble-the-locked-spec.md): spec written to
  `.scratch/game-import/spec.md`; ADR 0003 (import-only distribution) recorded; GLOSSARY
  gained **Game import** and **Game media**. **Destination reached** — hand the spec to a
  normal implementation flow (to-tickets → implement).

## Not yet specified

## Out of scope

- Implementing the import itself — the follow-on implementation effort after the spec lands.
- System sounds (app chrome) — stay shipped as-is.
- Hosting/deployment redesign (the deleted Express server's role) — separate effort.
- e2e tests, multiplayer, question-authoring tooling.
