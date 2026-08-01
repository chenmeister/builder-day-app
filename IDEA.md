# IDEA: Fridge-to-Recipe

## What we're building

A single-user app that turns whatever groceries you have on hand into a
recipe, so less food gets thrown out and you buy less than you need. You
keep a running list of what's in your fridge; the app asks an LLM to
generate a recipe from that list (it may call for 1-2 extra items); you can
save recipes you like. No accounts, no login — just your own kitchen.

## Version 1

Screens/actions:

1. **Fridge list** — view, add, and delete items (name + quantity only, no
   expiry dates).
2. **Generate recipe** — sends the current fridge list to an LLM, gets back
   a recipe plus a list of any extra ingredients it needs (the shopping
   list, computed by diffing the recipe against the fridge).
3. **Recipe view** — shows the generated recipe and its shopping list, with
   "Save" and "Generate another" buttons. Clicking "Generate another" on an
   unsaved recipe warns that it will be lost.
4. **Saved recipes** — list of recipes you've favorited, viewable later.

Data stored:

- `fridge_items`: id, name, quantity
- `saved_recipes`: id, title, ingredients, instructions, missing_items,
  created_at

## Later

- Barcode or photo scanning to add items instead of typing
- Expiry/purchase dates and staleness alerts
- "Restock what's low" shopping list (needs a minimum/par level per item)
- Matching against a curated recipe list instead of pure LLM generation
- Editing or rating a generated recipe
- Multi-user accounts
- Grocery delivery / ordering integration
