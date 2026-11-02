Type: grilling
Status: resolved

## Question

When an imported Game's id already exists in localStorage, what happens? Today `create()`
rejects with "Игра с Id N уже существует". Keep reject, replace existing, or assign a new
id? Cover legacy Games seeded by the old fetch flow (id "1") and whether the id is
user-meaningful for import at all.

## Answer

Settled with maintainer (2026-11-02):

- **Keep today's reject, verbatim.** Id clash → BalloonError «Игра с Id N уже существует»,
  `create()` returns null, no navigation — the user stays on home with the balloon as the
  only feedback. The author fixes the id in their JSON and re-imports. No replace, no
  auto-reassign, no confirm dialog, no changes to `create()`.
- **Legacy Games (id "1")**: untouched — no migration, no special-casing, no auto-delete of
  user data. They are ordinary entries; an imported pack with id "1" simply clashes with
  them under the same rule.
- **The id stays user-meaningful and author-controlled** — consistent with the list
  displaying `ID:{{ game.id }}`, which also stays unchanged (cosmetic list redesign is out
  of this effort's scope).

This resolves the map's legacy-Games fog item: there is no compat/migration story because
imported and legacy Games are the same shape in the same store.
