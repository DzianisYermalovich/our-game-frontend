Type: grilling
Status: resolved
Blocked by: 05

## Question

What does exporting a Game from localStorage look like: Game JSON only or Game + media,
single file or zip, and is round-trip (export → import) guaranteed identity? Decide the
story, including its role as backup against browser-storage loss.

## Answer

Settled with maintainer (2026-11-02):

- **Artifact: an import-format zip** — `game.json` at the root (the stored Game verbatim;
  ADR 0002's author-verbatim JSON makes this free) + media files at their referenced
  paths, packed with the same `fflate` dep the importer uses. Downloaded as
  `<game name>.zip` (filesystem-unsafe characters sanitized) via a normal browser download.
- **Round-trip guarantee: semantic identity** — same id, same refs, same media bytes — but
  **not** byte-identical JSON text (the localStorage write path normalizes formatting).
  Spec and tests assert semantics, never byte equality.
- **UI: an «Экспортировать» button on each Game row** in the saved-games list, beside
  «Продолжить игру»/«Удалить». Download-dialog cancel is a silent no-op. No export from
  inside an active game in v1.
- **Missing media: skip + warn, never block.** Unresolvable refs are skipped with a
  balloon warning («часть файлов не найдена — игра экспортирована без них»); a legacy Game
  with dead refs exports as JSON-only. Consistent with the graceful-degradation stance of
  tickets 02/04.
- **Role: export is the manual backup** against browser-storage loss (Safari's 7-day
  inactivity wipe, LRU pressure, cleared site data). `persist()` (ticket 05) is the only
  automatic guardrail; no scheduled/auto-backup in v1.
- **Audience note**: re-importing an export on the same browser trips ticket 03's id-clash
  reject — export targets backup and transfer to another browser/machine, which is
  expected behavior, not a bug.
