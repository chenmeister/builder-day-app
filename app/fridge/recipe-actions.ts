"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const recipeSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()),
  usedIngredients: z.array(z.string()),
  missingIngredients: z.array(z.string()),
});

export type Recipe = z.infer<typeof recipeSchema>;

export async function generateRecipe(): Promise<Recipe> {
  const { data: items, error } = await supabase
    .from("fridge_items")
    .select("name, quantity");

  if (error) {
    throw new Error(`Failed to load fridge items: ${error.message}`);
  }

  const fridgeList =
    items && items.length > 0
      ? items.map((item) => `${item.name} (x${item.quantity})`).join(", ")
      : "nothing";

  const { output } = await generateText({
    model: "anthropic/claude-sonnet-5",
    output: Output.object({ schema: recipeSchema }),
    prompt: `You are a home-cooking assistant helping reduce food waste.
Here is what's currently in the fridge: ${fridgeList}.

Suggest one recipe that uses as many of these ingredients as possible.
It's okay if the recipe needs 1-2 additional ingredients that aren't in
the fridge. Return:
- title: the recipe name
- steps: short numbered cooking steps as an array of strings
- usedIngredients: the fridge ingredients this recipe uses
- missingIngredients: any ingredients the recipe needs that are not in the fridge (empty array if none)`,
  });

  return output;
}
