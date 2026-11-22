# 0004 — Games split into an immutable GameTemplate and per-template Game instances

Until now one stored `Game` record carried everything: the pack content (rounds,
super round, settings, media refs), the player roster, and the play state
(`players[].score`, `Question.isAnswered` flags inside the content tree). That made
content and state inseparable: re-playing a pack meant overwriting it, a roster was
forced on every import, and the stored content tree was mutated by play. The record
now splits: **GameTemplate** — the importable read-only content a Game is created
from (name, author, rounds, super round, settings, media; Russian UI «Шаблон игры»)
— and **Game** — a playthrough instance holding its own roster and persistent state
(scores, answered question ids) while reading all content live from its template by
`templateId`. Unlimited instances can exist per template; deleting a template
cascades to its instances and media. Import ignores every pack-supplied id and
regenerates uuids at rest (pack ids are never trusted), so template **identity is
the name** (compared trimmed + case-insensitively; author-verbatim identity was
rejected deliberately) — the same name cannot be imported twice into one browser.
Instances persist exactly roster + answered ids + optional name + creation date
(state parity); templates live under a fresh `'game-templates'` localStorage key
while instances keep `'games'`. Full decision detail:
`.scratch/game-template/spec.md`.

Accepted consequences: play never writes the template — board marking and scores
go through instance intent ops (`addScore`, `markAnswered`) and answered rendering
is a render-time join over `answeredIds`; export re-zips the stored template
verbatim, so a same-browser re-import of an export always trips the name-conflict
reject (export targets sharing/backup, not round-trip); `Question.isAnswered` and
`PlayerService` die — each storage key gets exactly one owning service; old-shape
records get no code at all (no wipe, no skip filter — the maintainer clears site
data manually, and until then lingering records surface as broken entries); the
storage separation is hard to reverse once instances and templates diverge.

Considered options: roster on the template (rejected: it forces one roster per
pack and overwrites on re-play — the roster belongs to a playthrough, and multiple
games per pack is the point); answered flags on a copied content tree (rejected:
duplicates the whole tree per game and invites template mutation); pack ids kept
as-is (rejected: pack ids are untrusted — collisions and cross-pack clashes — and
flat answered-ids need global uniqueness, which generated uuids guarantee by
construction); template identity = author + name verbatim (rejected: author
strings vary between edits while the name is what users actually recognize);
one localStorage key with type-tagged records (rejected: two plain array keys
match the existing shape, keep legacy data quarantined to the old key, and the
data is tiny).
