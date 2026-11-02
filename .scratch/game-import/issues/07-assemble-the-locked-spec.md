Type: task
Status: resolved
Blocked by: 02, 03, 05, 06

## Question

Write `.scratch/game-import/spec.md` from the resolved tickets: import flow + validation,
conflict policy, media travel format + storage mechanism, export story, and removal scope
(`assets/temp/` incl. the unused Express server; `initGame.json` deleted from repo; system
sounds untouched). Record ADR-0002 (imported content — the app ships no game data) in
`docs/adr/` and add GLOSSARY.md terms (**Game import**, **Game media**).

## Answer

Done 2026-11-02. Artifacts:

- `.scratch/game-import/spec.md` — the locked spec: distribution (import-only), import
  flow, validation layers, conflict policy, storage (MediaStorage seam / IdbMediaStorage),
  export/backup, out-of-scope list, and a verification sketch for the implementation
  effort.
- `docs/adr/0003-import-only-distribution.md` — the "app ships no game data" decision with
  removal scope and consequences. **Numbering deviation**: the ticket anticipated this as
  ADR-0002, but 0002 was already taken by the MediaStorage seam ADR written during ticket
  05 — so the distribution ADR is 0003. Both are linked from the spec.
- `GLOSSARY.md` — added **Game import** and **Game media** (with _Avoid_ lists), placed
  after **Game**.

The map's destination is reached: the effort is ready to hand to a normal implementation
flow (to-tickets → implement) from the spec.
