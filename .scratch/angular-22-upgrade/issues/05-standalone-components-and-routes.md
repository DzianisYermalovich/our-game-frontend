Status: resolved

# 05 — Standalone components and routes

Port the 10 components as standalone with `@if/@for` control flow, `inject()`, zoneless CD.
Gate: **full manual game smoke** (see spec).

## Scope

- Components: app, home, error/ballon-error, game/layout/layout, game/layout/layout-with-score,
  game-list, game, round, super-round, question.
- `app.routes.ts`: same 6-route table, **order preserved** — `game/:gameId/round/super` before
  `game/:gameId/round/:roundId`; `pathMatch: 'full'` on `''`. Routes read snapshot params only;
  no guards/resolvers exist (nothing to functionalize).
- `app.config.ts`: `provideRouter(routes)`, `provideHttpClient()`, zoneless (verify scaffold
  default; add explicit `provideZonelessChangeDetection()` if needed).
- Templates: 16 `*ngIf` → `@if` (11 in question.component.html), 9 `*ngFor` → `@for`;
  `[ngStyle]`/`[ngClass]` stay; keep the two `<audio autoplay>` elements and the programmatic
  `Audio` + 60 s setTimeout (null-checked, never cancelled — preserve).
- BallonError: `@if (error(); as e)` + signal show/hide with `setTimeout` writing a signal
  (schedules CD correctly under zoneless); preserve the no-clearTimeout behavior or add it as a
  noted one-line deviation.
- layout-with-score: players column refreshes via `computed()` keyed off `ScoreUpdateService.version()`.
- Plain Map mutations in click handlers (answeredUsersMap, hideQuestionMap) stay Maps —
  template listeners schedule CD under zoneless; do not signal-ify.
- `ReactiveFormsModule` imported only into QuestionComponent; type the dynamic FormGroup
  (`FormGroup<Record<string, FormControl<string | null>>>` or pragmatic `any`).
- Wrapper chain (`app-layout`, `app-layout-with-score` = pure `ng-content` projectors) ported
  via imports arrays.

## Acceptance

Full game loop smokes: home → Новая игра → /game/1 → round → question → score updates without
reload → super round → back; error balloon appears + auto-hides on bad initGame.json.

## Comments

Done (commit 1e56226). Component suffix kept only where the class name collides with a model
(Game/Round/SuperRound/Question); other components use the v22 style (App, Home, Layout...).
Enums exposed as component properties for template comparisons (strictTemplates rejects
enum-to-string-literal comparisons). Manual smoke still pending — needs the maintainer.
