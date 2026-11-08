# 05: Export / backup

**What to build:** Each saved-games list row gains an «Экспортировать» button beside
«Продолжить игру» / «Удалить» (spec §6). Clicking it builds an **import-format zip** —
`game.json` at the root (stored Game verbatim) plus media at their referenced paths (same
fflate dependency) — and downloads it as `<game name>.zip` with filesystem-unsafe characters
sanitized; download-dialog cancel is a silent no-op. Export is the manual backup against
browser-storage loss (Safari 7-day wipe, LRU pressure, cleared site data); `persist()`
remains the only automatic guardrail. Missing media is **skip + warn, never block**:
unresolvable refs are skipped with a balloon warning, and a legacy Game with no stored media
exports as JSON-only. Same-browser re-import of the export trips the ticket-02 id-clash
reject — expected; export targets backup and transfer. Round-trip guarantee is **semantic
identity** (same id, same refs, same media bytes), not byte-identical JSON — tests assert
semantics, never bytes.

**Blocked by:** 02 (Zip import pipeline), 03 (Media storage behind the seam).

**Status:** done

- [x] «Экспортировать» on every list row produces a downloadable zip named after the Game
      with unsafe filename characters sanitized; dialog cancel is a silent no-op
- [x] The exported zip is import-format: `game.json` at the root (verbatim stored Game) +
      media at their referenced paths — re-zipping preserves zip-root-relative refs
- [x] Missing refs are skipped with a warning balloon and export succeeds; a legacy Game
      with no stored media exports as JSON-only zip
- [x] Semantic round-trip test: export a fixture Game → import path parses it → same id,
      same refs, same media bytes (JSON compared semantically, not byte-wise)
- [x] No export entry point inside the active game screen (list rows only)

## Comments

- `GameExportService` (`_services/export/game-export.service.ts`, `@Service()`): builds the
  zip as `{ 'game.json': strToU8(JSON.stringify(game)) }` plus every `collectMediaRefs(game)`
  ref (deduped) resolved through `MediaStorage.get(gameId, ref)` — the stored Game goes in
  verbatim including play-state mutations like `isAnswered`. `zipSync` (the same fflate the
  importer reads) compresses it; download via a temporary `<a download>` click, object URL
  revoked on the next macrotask. A cancelled download dialog never reaches the page — it is
  the browser's own no-op; nothing to handle and nothing to test in jsdom.
- Filename sanitization: Windows-forbidden characters (`< > : " / \ | ? *` + control chars)
  become underscores, trailing dots/spaces are dropped, and a name that sanitizes to nothing
  falls back to `игра.zip` — unit-tested for the full forbidden set, trailing-dot trimming,
  and the fallback.
- Skip + warn, never block: missing refs are collected during the loop, and if any, the
  balloon «Отсутствуют файлы мультимедиа, экспортированы без них: …» lists them; the zip
  still ships with what resolved. A legacy Game with no media exports as a JSON-only zip
  with no balloon. Export never validates the Game — it backs up whatever is stored.
- Round-trip test goes through the **real** import pipeline: export → `localStorage.clear()`
  + media wipe (fresh browser state) → `GameImportService.importPack(File)` → same id, Game
  deep-equal, same refs, media bytes equal. JSON compared semantically (`toEqual`), never
  byte-wise, per spec.
- Same-browser re-import of an export trips the ticket-02 id-clash reject — asserted
  existing behaviour in the import spec, unchanged here.
- jsdom gotcha worth remembering: fflate's `strToU8` returns a **Node-realm** Uint8Array
  (Node's TextEncoder) while `unzipSync` output is jsdom-realm — byte-identical arrays fail
  `toEqual` with "no visual difference". The spec compares via `Array.from(...)` (plain
  number arrays) instead of typed arrays.
- «Экспортировать» (btn-success) sits between «Продолжить игру» and «Удалить» in each
  row's btn-group; `GameList.exportGame(game)` fire-and-forgets the service like the delete
  path does. The active game screen has no export entry point — list rows only, per spec §6.
- Suite: 101 passed (was 92): 8 GameExportService tests + 1 game-list delegation test.
  Production build green (560.10 kB initial, +8.7 kB from fflate's zipSync side).
