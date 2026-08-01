"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function addFridgeItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!name || !Number.isFinite(quantity) || quantity < 1) {
    return;
  }

  const { error } = await supabase
    .from("fridge_items")
    .insert({ name, quantity });

  if (error) {
    throw new Error(`Failed to add item: ${error.message}`);
  }

  revalidatePath("/fridge");
}

export async function deleteFridgeItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const { error } = await supabase.from("fridge_items").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`);
  }

  revalidatePath("/fridge");
}
