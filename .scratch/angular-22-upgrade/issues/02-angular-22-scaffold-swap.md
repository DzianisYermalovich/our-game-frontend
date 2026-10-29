Status: resolved

# 02 — Angular 22 scaffold swap

Delete the legacy v7 workspace and generate a fresh Angular 22 scaffold in the repo root.
Gate: blank scaffold boots (`npm start`), builds (`ng build`), tests (`ng test`).

## Scope

- Delete: `angular.json`, `package.json`, `tsconfig.json`, `tslint.json` (+ `src/tslint.json`),
  `e2e/`, `karma.conf.js`, `src/karma.conf.js`, `src/test.ts`, `src/polyfills.ts`,
  `src/browserslist`, `src/environments/`, `src/main.ts`, `src/index.html`, `src/styles.scss`,
  `src/app/**`, `src/favicon.ico` (re-created by scaffold).
- Keep: `src/assets/**` (staged for restoration into `public/` in this ticket).
- `npx @angular/cli@22 new our-game-frontend --directory . --style=scss --ssr=false --skip-git --defaults --force`
- Move runtime assets to preserve the `assets/...` URL prefix: `public/assets/sounds/**`,
  `public/assets/temp/initGame.json` + `public/assets/temp/` tooling files (index.js,
  package.json, run.bat), `favicon.ico`. Missing `assets/images/` referenced by templates is
  pre-existing — do not invent it.
- Verify zoneless default: no `zone.js` in package.json.
- Verify `public/assets/temp/initGame.json` exists — 404 here = "app boots, game won't start".
- The dirty `package-lock.json` from develop is replaced by the scaffold-generated one.

## Acceptance

Blank scaffold: serve + build + test all green; assets in place; no zone.js.
