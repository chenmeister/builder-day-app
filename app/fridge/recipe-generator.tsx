"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateRecipe, type Recipe } from "./recipe-actions";

export function RecipeGenerator() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateRecipe();
        setRecipe(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Recipe
      </h2>

      <Button onClick={handleGenerate} disabled={isPending}>
        {isPending
          ? "Thinking..."
          : recipe
            ? "Generate another"
            : "Generate recipe"}
      </Button>

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {recipe && (
        <div className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-black dark:text-zinc-50">
            {recipe.title}
          </h3>

          <ol className="list-decimal space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
              From your fridge
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400">
              {recipe.usedIngredients.join(", ") || "None"}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
              Shopping list
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400">
              {recipe.missingIngredients.length > 0
                ? recipe.missingIngredients.join(", ")
                : "You have everything you need"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
