# OurGame — Своя игра

A "Своя игра"-style quiz game frontend: players pick questions from themed boards, answer
them, and accumulate score across rounds and a super round. Built with Angular 22 —
standalone components, signals, zoneless change detection, strict TypeScript.

The app runs entirely without a backend: a game is configured from a local JSON file
(`public/assets/temp/initGame.json`) and saved games are stored in the browser's
`localStorage` (key `games`).

## Commands

```bash
npm start       # dev server at http://localhost:4200
npm run build   # production build (application builder)
npm test        # unit tests (Vitest + jsdom)
```

## Project layout

- `src/app/_models`, `src/app/_enums` — game domain types (Game → Rounds → Topics → Questions, SuperRound, GameSettings, User)
- `src/app/_services/data/local-storage` — the localStorage-backed data services
- `src/app/_services/errors`, `src/app/_services/component-communication` — signal relays: balloon errors and score updates
- `src/app/game`, `src/app/home`, `src/app/error` — routed screens (home, game list, game board, round, super round, question) and the error balloon
- `src/assets/styles` — global SCSS partials; Bootstrap 5 imported in `src/assets/styles/main.scss`
- `public/assets` — runtime assets (game config JSON, sounds)
- `GLOSSARY.md` — domain vocabulary; `docs/adr` — architecture decisions

## Notes

- Sounds are referenced from `/assets/sounds/**`; images from `/assets/images/**` (the
  images directory is optional and may not exist in the repo).
- No end-to-end tests (Protractor e2e was removed with the Angular 22 migration).
- See `.scratch/angular-22-upgrade/` for the migration spec and tickets.
