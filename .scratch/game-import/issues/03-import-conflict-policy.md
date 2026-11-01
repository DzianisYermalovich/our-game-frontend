Type: grilling
Status: open

## Question

When an imported Game's id already exists in localStorage, what happens? Today `create()`
rejects with "Игра с Id N уже существует". Keep reject, replace existing, or assign a new
id? Cover legacy Games seeded by the old fetch flow (id "1") and whether the id is
user-meaningful for import at all.
