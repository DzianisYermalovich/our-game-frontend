Status: resolved

# 07 — Regenerate unit tests

The 16 legacy specs were CLI stubs on removed APIs (`TestBed.get`, `async`) and are deleted
with the old src tree. Regenerate minimal boot specs under Angular 22's default runner.

## Verify at execution (v22 runner specifics)

- Builder in angular.json (Vitest-era unit-test builder), config location (angular.json vs
  vitest config file).
- Global API (`describe/it/expect`) availability — `types: ["vitest/globals"]` vs imports.
- Runner mode (jsdom provides localStorage → service boot specs work without a browser).
- Zoneless TestBed shape (no zone-testing import, no initTestEnvironment).

## Scope

- `app.component.spec` (needs router provider for `router-outlet` + BalloonErrorService provider).
- Thin boot specs per service and per component.
- Suite green under `ng test`; zero legacy spec remnants.

## Acceptance

`ng test` green, CI-less local run.

## Comments

Done (commit e43c5eb). Runner verified: `@angular/build:unit-test` (Vitest 5 + jsdom),
globals via `types: ["vitest/globals"]`, no zone-testing setup. 36 tests / 16 files green.
