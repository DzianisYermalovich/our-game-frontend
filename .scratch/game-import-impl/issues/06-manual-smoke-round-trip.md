# 06: Manual smoke — full round-trip

**What to build:** The human verification pass from the locked spec's verification sketch
([`.scratch/game-import/spec.md`](../spec.md)): prove the whole import → play → export →
re-import story works in a real browser, then record the result. This closes the effort.

**Blocked by:** 04 (Media playback in the game screen), 05 (Export / backup).

**Status:** ready-for-human

- [ ] Import a historical-style pack (bare filename refs) → play rounds with media: images
      show, sounds play, answer images show
- [ ] Export the Game → clear site data (fresh browser state) → re-import the exported zip →
      play again; semantic identity holds (same id, refs resolve, media bytes identical)
- [ ] A legacy Game still listed with dead refs degrades quietly during play (hidden media,
      alt text, no balloons, no `/assets` fallback attempts)
- [ ] `persist()` prompt appears exactly once on first import in a browser that prompts;
      no re-prompt on later imports
- [ ] Id-clash reject on same-browser re-import observed («Игра с Id N уже существует») —
      expected behaviour
- [ ] Result recorded as a `## Comments` entry in this file (pass/fail + browser + date)
