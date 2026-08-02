import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  requireAuth,
  revalidatePath,
  selectMock,
  insertMock,
  fromMock,
  generateText,
  outputObject,
} = vi.hoisted(() => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const fromMock = vi.fn((table: string) =>
    table === "fridge_items" ? { select: selectMock } : { insert: insertMock }
  );
  return {
    selectMock,
    insertMock,
    fromMock,
    requireAuth: vi.fn(),
    revalidatePath: vi.fn(),
    generateText: vi.fn(),
    outputObject: vi.fn((opts: unknown) => opts),
  };
});

vi.mock("@/lib/supabase", () => ({ supabase: { from: fromMock } }));
vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("ai", () => ({
  generateText,
  Output: { object: outputObject },
}));

import { generateRecipe, saveRecipe, type Recipe } from "./recipe-actions";

const sampleRecipe: Recipe = {
  title: "Fridge Pasta",
  steps: ["Boil water", "Add pasta"],
  usedIngredients: ["Pasta"],
  missingIngredients: ["Garlic"],
};

describe("generateRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(undefined);
    generateText.mockResolvedValue({ output: sampleRecipe });
  });

  it("requires auth before reading fridge items", async () => {
    requireAuth.mockRejectedValue(new Error("Unauthorized"));

    await expect(generateRecipe()).rejects.toThrow("Unauthorized");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("throws when loading fridge items fails", async () => {
    selectMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    await expect(generateRecipe()).rejects.toThrow(
      "Failed to load fridge items: boom"
    );
    expect(generateText).not.toHaveBeenCalled();
  });

  it("includes fridge items in the prompt and returns the generated recipe", async () => {
    selectMock.mockResolvedValue({
      data: [{ name: "Eggs", quantity: 2 }],
      error: null,
    });

    const result = await generateRecipe();

    expect(result).toBe(sampleRecipe);
    const call = generateText.mock.calls[0][0];
    expect(call.prompt).toContain("Eggs (x2)");
  });

  it("tells the model the fridge is empty when there are no items", async () => {
    selectMock.mockResolvedValue({ data: [], error: null });

    await generateRecipe();

    const call = generateText.mock.calls[0][0];
    expect(call.prompt).toContain("nothing");
  });
});

describe("saveRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(undefined);
    insertMock.mockResolvedValue({ error: null });
  });

  it("requires auth before saving", async () => {
    requireAuth.mockRejectedValue(new Error("Unauthorized"));

    await expect(saveRecipe(sampleRecipe)).rejects.toThrow("Unauthorized");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts the recipe under snake_case columns and revalidates", async () => {
    await saveRecipe(sampleRecipe);

    expect(fromMock).toHaveBeenCalledWith("saved_recipes");
    expect(insertMock).toHaveBeenCalledWith({
      title: sampleRecipe.title,
      steps: sampleRecipe.steps,
      used_ingredients: sampleRecipe.usedIngredients,
      missing_items: sampleRecipe.missingIngredients,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/fridge/saved");
  });

  it("throws when the insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom" } });

    await expect(saveRecipe(sampleRecipe)).rejects.toThrow(
      "Failed to save recipe: boom"
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
