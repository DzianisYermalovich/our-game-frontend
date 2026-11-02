Type: grilling
Status: resolved

## Question

What is the Game import flow? Button label/placement on home (replacing the "Новая игра"
fetch), file-picker interaction, success/failure feedback (BalloonError vs inline), and
validation depth: reuse `isGameValid`'s structural checks, add field-type checks, verify
referenced media files were picked? Define what "valid" means for an imported Game.

## Answer

Settled with maintainer (2026-11-01). The import flow replaces `initGameFromJson()`'s
fetch entirely:

1. Home's primary button stays **«Новая игра»**, same spot beside «Продолжить игру».
2. Click → native file picker via a hidden `<input type="file">`. Cancel is a silent
   no-op. **What the user selects (multi-select / zip / directory) and the media reference
   scheme stay ticket 04's** — this flow skeleton is agnostic to them. Drag-and-drop is
   out of scope for the whole effort.
3. On pick: parse → validate → create → navigate straight into `/game/<id>`; the game
   screen is the success feedback (no toast, no landing on the list).
4. All failures (unparsable JSON, structural, type, missing media) surface as
   **BalloonError** — the app's only error pattern; no inline panel. Messages stay Russian
   and keep naming the offending round/topic/question.

What "valid" means for an imported Game — three layers:

- **Structural**: today's `isGameValid` count checks kept verbatim (rounds/topics/questions
  vs `settings`, superRound length, non-zero `minPrice`).
- **Light type checks**: required fields present and typed (`id`/`name` strings, `author`
  object, `players`/`rounds`/`images` arrays, `question.text`/`answer` strings, `type` a
  known QuestionType).
- **Media presence**: every media reference in the Game JSON must resolve to a picked file,
  or the import is **blocked** with a BalloonError naming the missing files. (Resolution
  mechanics — what "resolve" means per travel format — belong to ticket 04.)

The whole validator is extracted out of `GameService`'s private method into a shared
function so import and GameService cannot drift. Duplicate-id rejection stays as-is for
now — its policy is ticket 03's question.
