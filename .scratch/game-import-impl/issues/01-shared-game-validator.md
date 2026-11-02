# 01: Shared Game validator

**What to build:** One shared validator that decides whether Game JSON is valid, extracted
from GameService's private validation so import and GameService cannot drift. It implements
the first two validation layers from the locked spec
([`.scratch/game-import/spec.md`](../spec.md) §3): the existing structural checks **verbatim**
(counts vs settings for rounds, topics per round, questions per topic, super-round questions;
non-zero `minPrice`; same Russian balloon messages) plus the light field/type layer — required
fields present and typed (`id`/`name` strings, `author` object, `players`/`rounds`/`images`
arrays, `question.text`/`answer` strings, `question.type` a known QuestionType). GameService
switches to the shared validator with no behaviour change; import (ticket 02) will consume it
next.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] GameService's structural checks move into the shared validator verbatim, Russian
      failure messages unchanged
- [x] Light field/type layer added: a malformed Game (missing/ill-typed id, name, author,
      players, rounds, images, question text/answer, unknown question type) fails validation
      with a balloon naming the offending round/topic/question
- [x] Validator returns enough detail for the caller to surface a BalloonError (not just a
      boolean), and raises nothing itself — the caller decides
- [x] Unit tests cover both layers using the existing Game fixture (valid fixture passes;
      one test per broken invariant)
- [x] Existing GameService behaviour is unchanged (its spec still passes)

## Comments

- `validateGame(game: Game): string | null` lives at `src/app/_validators/game-validator.ts`;
  pure, no Angular deps, returns the balloon message or null — the caller surfaces it via
  `BalloonErrorService.raise`. Light field/type layer runs **before** the structural block so
  ill-typed input cannot crash the count checks (and returns a message where the old code
  threw, e.g. missing `settings`).
- `images` is validated **optional, array-if-present**: the spec text lists it among "required
  fields", but enforcing presence would contradict "GameService switches with no behaviour
  change" (legacy `initGame.json` has no `images`). `Game.images?: string[]` was added to the
  model for the check to typecheck; import (ticket 02) may populate it.
- Ordering note: ill-typed `rounds` now gets «Неправильный список раундов…» instead of the old
  accidental count message; the ticket's light-layer requirement mandates this. The pinned
  structural messages are unchanged.
- Post-review hardening (both review axes flagged throws): null/ill-typed entries inside
  `rounds`/`topics`/`questions`, truthy non-object `superRound`, and non-array
  `superRound.questions` now return messages instead of throwing. Missing `superRound` still
  falls to the verbatim structural check.
- The structural block keeps its original internal guards verbatim (including the
  «колличство» spelling); the light/structural traversal duplication is deliberate —
  consolidating would un-pin the verbatim move.
- Deferred to ticket 02: whether import should pass parsed JSON through an `unknown`-typed
  entry point (reviewer suggestion); today's signature takes `Game` per the agreed seam.
