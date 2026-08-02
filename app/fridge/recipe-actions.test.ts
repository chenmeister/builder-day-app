import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  requireAuth,
  revalidatePath,
  selectMock,
  insertMock,
  deleteEqMock,
  fromMock,
  generateText,
  outputObject,
} = vi.hoisted(() => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const deleteEqMock = vi.fn();
  const fromMock = vi.fn((table: string) =>
    table === "fridge_items"
      ? { select: selectMock }
      : { insert: insertMock, delete: vi.fn(() => ({ eq: deleteEqMock })) }
  );
  return {
    selectMock,
    insertMock,
    deleteEqMock,
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

import {
  generateRecipe,
  saveRecipe,
  deleteSavedRecipe,
  type Recipe,
} from "./recipe-actions";

function formDataWith(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

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

describe("deleteSavedRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(undefined);
    deleteEqMock.mockResolvedValue({ error: null });
  });

  it("requires auth before deleting", async () => {
    requireAuth.mockRejectedValue(new Error("Unauthorized"));
    const formData = formDataWith({ id: "5" });

    await expect(deleteSavedRecipe(formData)).rejects.toThrow("Unauthorized");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("deletes the recipe by id and revalidates the saved page", async () => {
    const formData = formDataWith({ id: "5" });

    await deleteSavedRecipe(formData);

    expect(fromMock).toHaveBeenCalledWith("saved_recipes");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "5");
    expect(revalidatePath).toHaveBeenCalledWith("/fridge/saved");
  });

  it("does nothing when id is missing", async () => {
    const formData = formDataWith({});

    await deleteSavedRecipe(formData);

    expect(deleteEqMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("throws when the delete fails", async () => {
    deleteEqMock.mockResolvedValue({ error: { message: "boom" } });
    const formData = formDataWith({ id: "5" });

    await expect(deleteSavedRecipe(formData)).rejects.toThrow(
      "Failed to delete recipe: boom"
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
