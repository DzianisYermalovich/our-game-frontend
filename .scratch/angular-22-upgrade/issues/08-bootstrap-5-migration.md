Status: resolved

# 08 — Bootstrap 5 migration

Bootstrap 4 → 5.3, visual parity, CSS-only (no BS JS plugins were ever loaded).

## Scope

- `bootstrap@^5.3` in package.json.
- `main.scss`: `@use "bootstrap/scss/bootstrap";` (kills the deprecated `~` prefix); decide
  `@use ... as *` for the 4 `common/` partials so `$color-*`/`$dimension-*` call sites stay
  unchanged (no BS variables/mixins are used anywhere today).
- Kill remaining `~` prefixes in 5 component scss files: layout.component.scss:1-2,
  layout-with-score.component.scss:1, round.component.scss:1, super-round.component.scss:1,
  home.component.scss:1 (relative paths or stylePreprocessorOptions.includePaths).
- Template drift (complete list from inventory): `form-group` → `mb-3`
  (question.component.html:60); drop `navbar-light` (layout.component.html:1).
- Parity pass screen-by-screen vs develop build; watch the gutter change (30px → 1.5rem) on the
  bordered round/super-round grids (borders drawn on `.row`/`.col` in component scss).

## Acceptance

Visual parity on: home, game list, game, round grid, super-round grid, question states
(TYPE/TOPIC/QUESTION/ANSWER), balloon, navbar; no sass deprecation warnings.

## Comments

Done as part of the port commit (1e56226) — Bootstrap 5.3 + `@use` conversion landed with the
component port so styles compiled from the start. Only two template drifts existed and both are
fixed (form-group -> mb-3, navbar-light dropped). Screen-by-screen parity check pending —
part of the manual smoke.
