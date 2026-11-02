# 02: Zip import pipeline

**What to build:** The «Новая игра» button becomes a real import flow (spec §2–§4, ADR 0003).
Clicking it opens the native file picker for a single `.zip` (hidden file input; cancel is a
silent no-op). The zip is unpacked (fflate), the single root-level `.json` found and parsed,
then validated with the shared validator (ticket 01) plus the third layer: every
zip-root-relative media ref in `image`/`sound`/`answerImage` must resolve to a file inside
the zip; refs escaping the zip root are rejected; unreferenced files (`__MACOSX`,
`.DS_Store`, …) are ignored; MIME types are not policed. On a valid pack the id-clash
pre-check runs (today's reject verbatim: «Игра с Id N уже существует», no navigation, no
changes to Game creation) and the Game is created and the user lands on `/game/<id>` — the
game screen itself is the success feedback, no toast. Every failure (unparsable JSON,
structural, type, missing media) surfaces as a BalloonError in Russian naming the offending
round/topic/question or listing the missing media files. With the import flow live, the old
fetch distribution dies per ADR 0003: the initGame fetch flow is removed, `initGame.json`
leaves the repo, and `public/assets/temp/` is deleted entirely including the unused Express
server files. Media bytes are not yet stored — imported games are playable but their media
refs render dead until tickets 03–04.

**Blocked by:** 01 (Shared Game validator).

**Status:** ready-for-agent

- [ ] «Новая игра» (same spot beside «Продолжить игру») opens the native picker accepting a
      single `.zip`; picker cancel changes nothing and shows nothing
- [ ] A well-formed pack imports: Game created, user lands on `/game/<id>`, the pack is
      listed on the saved-games screen
- [ ] Exactly one root-level `.json` required: zero or several root-level json files fail
      with a clear Russian balloon
- [ ] Structural and field/type violations fail with balloons naming the offending
      round/topic/question (shared validator, ticket 01)
- [ ] A pack referencing a media file absent from the zip is blocked, the balloon listing
      the missing files; a ref escaping the zip root (`../`, absolute) is rejected
- [ ] Unreferenced junk files (`__MACOSX`, `.DS_Store`) do not block import
- [ ] Id clash rejects verbatim («Игра с Id N уже существует») with no navigation and no
      changes to Game creation
- [ ] Old fetch flow removed: no initGame fetch, `initGame.json` and `public/assets/temp/`
      (incl. the Express server files) deleted from the repo; a fresh browser shows the
      empty-list state until first import
- [ ] Unit tests: zip layout rules, all validation failures, clash pre-check, happy path
