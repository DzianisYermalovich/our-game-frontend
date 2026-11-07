# 02: Zip import pipeline

**What to build:** The «Новая игра» button becomes a real import flow (spec §2–§4, ADR 0003).
Clicking it opens the native file picker for a single `.zip` (hidden file input; cancel is a
silent no-op). The zip is unpacked (fflate), the single root-level `.json` found and parsed,
then validated with the shared validator (ticket 01) plus the third layer: every
zip-root-relative media ref in `image`/`sound`/`answerImage` must resolve to a file inside
the zip; refs escaping the zip root are rejected; unreferenced files (`__MACOSX`,
`.DS_Store`, …) are ignored; MIME types are not policed. On a valid pack the id-clash
pre-check runs (today's reject verbatim: «Игра с Id N уже существует», no navigation, no
changes to Game creation) and the Game is created and the user lands on `/game/<id>` — the
game screen itself is the success feedback, no toast. Every failure (unparsable JSON,
structural, type, missing media) surfaces as a BalloonError in Russian naming the offending
round/topic/question or listing the missing media files. With the import flow live, the old
fetch distribution dies per ADR 0003: the initGame fetch flow is removed, `initGame.json`
leaves the repo, and `public/assets/temp/` is deleted entirely including the unused Express
server files. Media bytes are not yet stored — imported games are playable but their media
refs render dead until tickets 03–04.

**Blocked by:** 01 (Shared Game validator).

**Status:** done

- [x] «Новая игра» (same spot beside «Продолжить игру») opens the native picker accepting a
      single `.zip`; picker cancel changes nothing and shows nothing
- [x] A well-formed pack imports: Game created, user lands on `/game/<id>`, the pack is
      listed on the saved-games screen
- [x] Exactly one root-level `.json` required: zero or several root-level json files fail
      with a clear Russian balloon
- [x] Structural and field/type violations fail with balloons naming the offending
      round/topic/question (shared validator, ticket 01)
- [x] A pack referencing a media file absent from the zip is blocked, the balloon listing
      the missing files; a ref escaping the zip root (`../`, absolute) is rejected
- [x] Unreferenced junk files (`__MACOSX`, `.DS_Store`) do not block import
- [x] Id clash rejects verbatim («Игра с Id N уже существует») with no navigation and no
      changes to Game creation
- [x] Old fetch flow removed: no initGame fetch, `initGame.json` and `public/assets/temp/`
      (incl. the Express server files) deleted from the repo; a fresh browser shows the
      empty-list state until first import
- [x] Unit tests: zip layout rules, all validation failures, clash pre-check, happy path

## Comments

- `GameImportService` (`src/app/_services/import/game-import.service.ts`) owns the pipeline:
  unzip (fflate `unzipSync`) → single root-level `.json` (no `/` in key, `.json` suffix
  case-insensitive) → `JSON.parse` → `validateGame` → media layer → `create()` → navigate.
  Home only wires the hidden `<input type="file" accept=".zip">` to it; the input value is
  reset after every change so the same failing pack can be re-picked.
- Media layer (spec §3) is two pure module functions: `collectMediaRefs` gathers
  `game.images`, question `image[]`/`sound`/`answerImage` across rounds and the super round
  (empty refs dropped, duplicates deduped); `checkMediaRefs` rejects escaping refs first
  (leading `/` or `\`, Windows drive letter, any `..` segment — backslash treated as a
  separator), then lists refs with no exact key match. `__MACOSX/._game.json` is
  deliberately not root-level, so junk jsons in subdirectories can't hijack the config.
- Ticket-01 reviewer question resolved: the parse result enters as `unknown`; a non-object
  (`null`, array, scalar) is rejected with «Неправильная структура файла-конфигурации»
  before the `as Game` cast, so `JSON.parse('null')` cannot crash the validator.
- `@Service()` (Angular 22 auto-provided decorator) used for the new service; `providedIn`
  is not part of its options. `GameService` lost `initGameFromJson`, `HttpClient`, and its
  router dep; `provideHttpClient()` is gone from `app.config.ts` — nothing else used it.
- Message wording mirrors the validator's style: «В корне архива должен быть ровно один
  файл-конфигурация .json, найдено: N», «Не удалось распаковать архив с игрой», «Не удалось
  разобрать JSON в файле-конфигурации», «Пути выходят за пределы архива: …»,
  «Отсутствуют файлы в архиве: …».
- Tests use real fflate `zipSync` round-trips (no zip mocks): 12 import tests, 4 home tests
  (picker opens, pack handed to the service, cancel no-op), GameService spec reduced to pure
  CRUD. Suite: 73 passed. Media is deliberately not stored — imported games' media refs
  render dead until tickets 03–04.
