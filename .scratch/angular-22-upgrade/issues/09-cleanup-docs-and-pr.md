Status: resolved

# 09 — Cleanup, docs, PR

Final pass and delivery.

## Scope

- Grep gates (all must be zero): `*.module.ts`, `*ngIf|*ngFor|*ngSwitch`, `constructor(` DI,
  `.subscribe(` outside game.service.ts, `~` in scss, `form-group`, `navbar-light`,
  `TestBed.get`, animations/core-js/protractor/tslint in package.json.
- Budgets: keep scaffold defaults (500 kB/1 MB) — app is far under either.
- README refresh (Angular 22, scripts, no e2e), `.gitignore` reconcile with scaffold version.
- Ticket Status lines → resolved; ADR-0001 final content.
- Staged commits per ticket; single PR → develop (body per /pr conventions + attribution).

## Acceptance

All spec verification items pass; PR open against develop.
