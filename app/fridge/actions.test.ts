import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAuth, revalidatePath, insertMock, deleteEqMock, fromMock } =
  vi.hoisted(() => {
    const insertMock = vi.fn();
    const deleteEqMock = vi.fn();
    const fromMock = vi.fn(() => ({
      insert: insertMock,
      delete: vi.fn(() => ({ eq: deleteEqMock })),
    }));
    return {
      insertMock,
      deleteEqMock,
      fromMock,
      requireAuth: vi.fn(),
      revalidatePath: vi.fn(),
    };
  });

vi.mock("@/lib/supabase", () => ({ supabase: { from: fromMock } }));
vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { addFridgeItem, deleteFridgeItem } from "./actions";

function formDataWith(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("addFridgeItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(undefined);
    insertMock.mockResolvedValue({ error: null });
  });

  it("requires auth before touching the database", async () => {
    requireAuth.mockRejectedValue(new Error("Unauthorized"));
    const formData = formDataWith({ name: "Eggs", quantity: "2" });

    await expect(addFridgeItem(formData)).rejects.toThrow("Unauthorized");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts a trimmed item and revalidates the home page", async () => {
    const formData = formDataWith({ name: "  Eggs  ", quantity: "3" });

    await addFridgeItem(formData);

    expect(fromMock).toHaveBeenCalledWith("fridge_items");
    expect(insertMock).toHaveBeenCalledWith({ name: "Eggs", quantity: 3 });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("defaults quantity to 1 when not provided", async () => {
    const formData = formDataWith({ name: "Milk" });

    await addFridgeItem(formData);

    expect(insertMock).toHaveBeenCalledWith({ name: "Milk", quantity: 1 });
  });

  it("does nothing when the name is blank", async () => {
    const formData = formDataWith({ name: "   ", quantity: "2" });

    await addFridgeItem(formData);

    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does nothing when quantity is not a positive number", async () => {
    const formData = formDataWith({ name: "Eggs", quantity: "0" });

    await addFridgeItem(formData);

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("throws when the insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "boom" } });
    const formData = formDataWith({ name: "Eggs", quantity: "1" });

    await expect(addFridgeItem(formData)).rejects.toThrow(
      "Failed to add item: boom"
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteFridgeItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(undefined);
    deleteEqMock.mockResolvedValue({ error: null });
  });

  it("requires auth before touching the database", async () => {
    requireAuth.mockRejectedValue(new Error("Unauthorized"));
    const formData = formDataWith({ id: "123" });

    await expect(deleteFridgeItem(formData)).rejects.toThrow("Unauthorized");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("deletes the item by id and revalidates the home page", async () => {
    const formData = formDataWith({ id: "abc-123" });

    await deleteFridgeItem(formData);

    expect(fromMock).toHaveBeenCalledWith("fridge_items");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "abc-123");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("does nothing when id is missing", async () => {
    const formData = formDataWith({});

    await deleteFridgeItem(formData);

    expect(deleteEqMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("throws when the delete fails", async () => {
    deleteEqMock.mockResolvedValue({ error: { message: "boom" } });
    const formData = formDataWith({ id: "abc-123" });

    await expect(deleteFridgeItem(formData)).rejects.toThrow(
      "Failed to delete item: boom"
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
