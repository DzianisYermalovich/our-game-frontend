# Spec: Angular 7.1 → 22.2 upgrade (fresh scaffold + port)

## Goal

Land `our-game-frontend` on the latest stable Angular (22.2.x) by generating a fresh Angular 22
scaffold in the repo root and porting the app's ~58 source files into it as fully modern Angular —
not by stepping through 15 majors with `ng update`. See ADR-0001 for why.

## Decisions (settled with the maintainer, 2026-10-29)

1. Fresh scaffold + port; ADR-0001 records the trade-off.
2. Maximum-modern port: standalone components, `@if/@for` control flow, `inject()`,
   signals everywhere (including replacing the Subject-relay services),
   zoneless change detection, esbuild application builder, `provideHttpClient()`.
3. Strict TypeScript (`strict` + `strictTemplates`).
4. Delete all 16 legacy specs (verified CLI stubs on removed APIs); regenerate minimal boot
   specs under Angular 22's default runner.
5. Delete Protractor `e2e/` (single stale scaffold spec); no replacement for now.
6. Bootstrap 4 → 5.3 with visual parity; CSS-only (no BS JS plugins today).
7. Drop dead weight: `@angular/animations` (zero usage), core-js, zone.js, environments/
   fileReplacements, tslint, browserslist file.
8. Dependencies: RxJS 7.8.x, TS 6.0.x (Angular 22 peer range), Node ≥26 (local Node 26.13 OK).
9. Done = production build green + unit tests green + manual game smoke, backend-free
   (the app has no backend: the only HttpClient call fetches local `assets/temp/initGame.json`).
10. Delivery: branch `angular-22-upgrade`, staged commits, single PR → develop.

## Scope

- In: workspace swap (angular.json/tsconfig/builders/tests/lint), app source port
  (models, enums, services, 10 components, routes, templates, styles), Bootstrap 5 migration,
  regenerated unit tests, glossary + ADR.
- Out: Playwright/Cypress e2e, Bootstrap JS plugins, strict-mode-adjacent refactors beyond
  compilation, fixing pre-existing bugs found during port (preserved as-is, noted in tickets),
  `assets/images/` referenced by question templates but missing from the repo.

## Key technical facts (verified)

- App is a Russian "Своя игра"-style quiz: Game → Rounds → Topics → Questions, SuperRound,
  settings {rounds, topicsInRound, questionsInTopic, superQuestions, minPrice}, Players, scores.
- Data layer is localStorage-backed (key `games`, read-modify-write of the whole array from 4
  services). No apiUrl anywhere; `GameService.initGameFromJson()` fetches local
  `assets/temp/initGame.json` and validates shape via `isGameValid`.
- Cross-component comms today: generic RxJS Subject relay
  (`base-component-communication.ts` → `score-update.service`, `balloon-error.service`).
  Under zoneless this relay would silently freeze UI for async emissions (HttpClient error
  callbacks) — the signals conversion is functionally required, not cosmetic.
- Zoneless-sensitive sites: ballon-error auto-hide timer (5000 ms), question 60 s audio timer
  (never cancelled — preserve behavior).
- Route order is load-bearing: `game/:gameId/round/super` must precede `game/:gameId/round/:roundId`.
- Bootstrap 5 drift present: `form-group` (question.component.html:60) and `navbar-light`
  (layout.component.html:1) only; gutter change 30px → 1.5rem affects bordered grids.
- v22 scaffold puts static assets in `public/` — runtime assets must land as
  `public/assets/**` to preserve the `assets/...` URL prefix.

## Tickets

See `issues/01..09-*.md`. Status lines updated as work completes.

## Verification (definition of done)

1. `npm run build` (production) green under the application builder.
2. `ng test` green with regenerated boot specs; zero legacy `TestBed.get`/`async` specs.
3. Manual smoke: home → "Новая игра" (loads initGame.json, navigates /game/1) → rounds +
   Супер раунд → play a round → open a question → answers update score column without reload
   (proves signals + zoneless) → super round → back. Error path: hide initGame.json → click
   "Новая игра" → balloon appears and auto-hides ~5 s. Sounds resolve.
4. Zoneless verified: no zone.js in package.json; no polyfills zone import.
5. Grep gates all zero: `*.module.ts`, `*ngIf|*ngFor|*ngSwitch`, `constructor(` DI,
   `.subscribe(` outside game.service.ts, `~` in scss imports, `form-group`, `navbar-light`,
   `TestBed.get`, animations/core-js/protractor/tslint in package.json.
6. Bootstrap parity vs develop build on: home, game list, game, round grid, super-round grid,
   question states, balloon, navbar.
7. Docs present: spec + 9 tickets with Status, GLOSSARY.md, docs/adr/0001.
