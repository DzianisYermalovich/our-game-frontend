Status: resolved

# 04 — Port services and signal relays

Port the 4 localStorage data services + 2 relay services to Angular 22 / signals.

## Scope

- `game.service.ts`, `player.service.ts`, `question.service.ts`, `round.service.ts`:
  constructor injection → `inject()`; strict-safe read path
  `JSON.parse(localStorage.getItem('games') ?? '[]')`; keep read-modify-write of the shared
  `games` key and all error-message strings (Russian) verbatim; keep `delete()` splice without
  -1 guard (pre-existing behavior, preserved) and `update()` returning null (widen interface
  return types instead of changing behavior).
- Keep `GameService.initGameFromJson()` + `isGameValid()` logic verbatim; this stays the only
  `.subscribe(` site in the app (optionally modernize to `{ next, error }` observer form).
- Replace the Subject-relay hierarchy:
  - `BalloonErrorService.error = signal<ErrorBase | null>(null)` + `raise(description)`.
  - `ScoreUpdateService.version = signal(0)` + `bump()`.
  - Delete `base-component-communication.ts` (generic Subject base class) and the
    `-service-interface.ts` files if their shapes are fully absorbed.
- Widen nullable return types from `getById` cascades (`Game | undefined` etc.) as needed for
  strict compilation of consumers (question/round services, round-service-interface untyped params).

## Acceptance

Services compile strict; zero `.subscribe(` outside game.service.ts; no Subject/BehaviorSubject
remains in the app.

## Comments

Done (commit 1e56226). Signal relays: `BalloonErrorService.raise()` / `ScoreUpdateService.bump()`.
Deviations from verbatim behavior (all in already-broken scenarios where the old code crashed):
missing game/player now degrades gracefully instead of throwing; `updateQuestion` -1-index guards
added; unused `questionService` injection dropped from PlayerService.

Maintainer correction (2026-10-31): the four data interfaces (game/player/question/round) are
restored and the localStorage services `implements` them — they exist so future data fetchers
(only local-storage today) can be swapped in behind the same contracts.
