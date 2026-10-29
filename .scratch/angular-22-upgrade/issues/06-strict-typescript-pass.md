Status: resolved

# 06 — Strict TypeScript pass

Ensure `strict: true` + `strictTemplates` compile clean across the ported app.

## Known hazards (from fact-find)

- `JSON.parse(localStorage.getItem('games'))` null-safety — solved in ticket 04.
- Model `= null` parameter properties — solved by interface conversion (ticket 03).
- Typed Forms index access on dynamic FormGroup (question.component.ts:24,73,103).
- Nullable cascades: `getById` → `Game | undefined` through player/question/round services and
  game.component.ts:21-22 (then template `game.rounds`), layout-with-score.component.ts:31.
- Interface mismatches: `update(): Game` returning null; `countQuestionValue` typed `number`
  returning null (question.service.ts:47); `getQuestion` returning undefined.
- Untyped params in round-service-interface.ts.
- strictTemplates: `games?.length > 0` (game-list.component.html:5,45),
  `question.image?.length > 0` (question.component.html:36), `{{error.description}}`
  (solved by `@if (error(); as e)`), `audio: Audio | null`.

## Acceptance

`ng build` and `ng serve` green with strict flags on; no `@ts-ignore`/`any` escapes beyond the
FormGroup decision recorded in ticket 05.

## Comments

Done (commit 1e56226). Notable: the v22 scaffold no longer sets `strict: true` by default —
added `strict` + `strictTemplates` manually. Template enum comparisons and redundant optional
chains (NG8107) cleaned; build is warning-free.
