Status: ready-for-agent

# 03 — Port models and enums

Port `src/app/_enums` (3 string enums: question-state, question-types, roles) and
`src/app/_models` (8 files) to strict TypeScript under Angular 22.

## Key fact

The model classes (game, round, topic, question, super-round, game-settings, user,
error-base) are **never constructed anywhere** — JSON from initGame.json arrives as plain
objects. Convert all 8 classes to interfaces. The only `new` site is
`game.service.ts:109 new ErrorBase()` → becomes an object literal `{ description }`.

## Acceptance

- `_models/*` are interfaces; `_enums/*` unchanged string enums; compile clean under strict.
- No behavioral change (types only).
