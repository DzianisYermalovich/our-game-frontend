# 0003 — Games enter the app only by user import; the app ships no game data

Until now the app shipped a demo Game: the «Новая игра» button fetched
`assets/temp/initGame.json` over HTTP and seeded it into localStorage, and
`public/assets/temp/` also carried an unused Express server (`index.js`, `package.json`,
`run.bat`) left over from an earlier hosting approach. Game content now enters exclusively
by user file import (a zip per pack — see `.scratch/game-import/spec.md`), so the app ships
no game data: `public/assets/temp/` is deleted entirely and `initGame.json` leaves the repo
(git history keeps it). System sounds (`public/assets/sounds/system/`) stay — app chrome,
not game content.

Accepted consequences: a fresh browser shows an empty saved-games list
(«У вас нет сохранённых игр =(») until the user imports a pack; «Новая игра» changes
behavior from fetch to import; legacy Games seeded by the old flow remain in existing
browsers' localStorage untouched (no migration — see ticket 03); validation of user packs
replaces the (lost) guarantee of a known-good shipped file, hence the shared validator's
three layers in the spec.

Considered options: keeping a bundled starter Game alongside import (rejected: two content
paths to maintain and validate, contradicting the import-only contract); keeping the
Express server (rejected: unused by the static frontend deployment; deletion was already
settled at charting).
