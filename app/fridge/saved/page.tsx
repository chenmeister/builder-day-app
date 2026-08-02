import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { deleteSavedRecipe } from "../recipe-actions";

export const dynamic = "force-dynamic";

export default async function SavedRecipesPage() {
  const { data: recipes, error } = await supabase
    .from("saved_recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load saved recipes: ${error.message}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8 py-32 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Saved Recipes
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          >
            Back to fridge
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {recipes?.map((recipe) => (
            <div
              key={recipe.id}
              className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                  {recipe.title}
                </h2>
                <form action={deleteSavedRecipe}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>

              <ol className="list-decimal space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
                {recipe.steps.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <div>
                <h3 className="font-medium text-zinc-800 dark:text-zinc-200">
                  From your fridge
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {recipe.used_ingredients.join(", ") || "None"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-zinc-800 dark:text-zinc-200">
                  Shopping list
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {recipe.missing_items.length > 0
                    ? recipe.missing_items.join(", ")
                    : "You have everything you need"}
                </p>
              </div>
            </div>
          ))}

          {recipes?.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400">
              No saved recipes yet — generate one from the fridge page and
              save it.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
