# Map: Game content import

## Destination

A locked spec under `.scratch/game-import/spec.md`: Games enter localStorage by user file
import (the app ships no game data; `assets/temp/` gone), per-question media travels with
the imported Game and lives browser-side (mechanism decided), and an export/backup story is
decided. Ready to hand to a normal implementation effort.

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

## Not yet specified

- Legacy localStorage Games (seeded by the old fetch flow, id "1"): compat/migration once
  import-only lands — sharpens after the conflict-policy ticket resolves.
- File System Access API / directory-picker support limits — may graduate from research +
  travel-format tickets.
- Oversized packs: what happens when a Game + media exceeds practical storage limits —
  may graduate from research + storage-mechanism tickets.

## Out of scope

- Implementing the import itself — the follow-on implementation effort after the spec lands.
- System sounds (app chrome) — stay shipped as-is.
- Hosting/deployment redesign (the deleted Express server's role) — separate effort.
- e2e tests, multiplayer, question-authoring tooling.
