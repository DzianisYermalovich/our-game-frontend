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

**Status:** ready-for-agent

- [ ] «Экспортировать» on every list row produces a downloadable zip named after the Game
      with unsafe filename characters sanitized; dialog cancel is a silent no-op
- [ ] The exported zip is import-format: `game.json` at the root (verbatim stored Game) +
      media at their referenced paths — re-zipping preserves zip-root-relative refs
- [ ] Missing refs are skipped with a warning balloon and export succeeds; a legacy Game
      with no stored media exports as JSON-only zip
- [ ] Semantic round-trip test: export a fixture Game → import path parses it → same id,
      same refs, same media bytes (JSON compared semantically, not byte-wise)
- [ ] No export entry point inside the active game screen (list rows only)
