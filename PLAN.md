# PLAN: Fridge-to-Recipe

## Phase 1 — Fridge list

**Build:** A single page listing fridge items, with a form to add an item
(name + quantity) and a delete action per row. Reads are a server
component querying Supabase directly; add/delete are Server Actions.

**Schema change:** New `fridge_items` table (`id`, `name`, `quantity`,
`created_at`). Created via `npx supabase migration new create_fridge_items_table`,
RLS enabled with no policies, SQL shown for approval before
`npx supabase db push` — per the Step 6 migration workflow.

**Verify in browser:** Load the page, add a couple of items, see them
appear in the list, delete one, see it disappear. Refresh — items persist.

---

## Phase 2 — Generate a recipe

**Build:** A "Generate recipe" button that sends the current fridge list
to an LLM and displays the returned recipe (title, instructions) plus a
shopping list — any ingredients the recipe needs that aren't in your
fridge. Nothing is persisted yet; each generation is disposable, with a
"Generate another" button that just re-runs it.

**Schema change:** None — this phase only reads `fridge_items`; nothing
new is stored.

**Verify in browser:** With items in your fridge from Phase 1, click
"Generate recipe" and see a real recipe appear, using your ingredients,
with a shopping list for whatever it's missing. Click "Generate another"
and see a different recipe.

---

## Phase 3 — Save recipes

**Build:** A "Save" button on the recipe view that persists the current
recipe. If "Generate another" is clicked on an unsaved recipe, show a
warning that it will be lost. A new "Saved recipes" page lists everything
you've favorited.

**Schema change:** New `saved_recipes` table (`id`, `title`,
`ingredients`, `instructions`, `missing_items`, `created_at`). Created via
`npx supabase migration new create_saved_recipes_table`, RLS enabled with
no policies, SQL shown for approval before `npx supabase db push`.

**Verify in browser:** Generate a recipe, click Save, navigate to Saved
Recipes, see it listed. Generate a new recipe, click "Generate another"
without saving first, confirm the warning appears.

---

## Later (not scheduled yet)

Carried over from `IDEA.md`, to become future phases when prioritized:

- Barcode or photo scanning to add fridge items instead of typing
- Expiry/purchase dates and staleness alerts
- "Restock what's low" shopping list (needs a minimum/par level per item)
- Matching against a curated recipe list instead of pure LLM generation
- Editing or rating a generated recipe
- Multi-user accounts
- Grocery delivery / ordering integration
