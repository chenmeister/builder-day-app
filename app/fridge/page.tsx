import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFridgeItem, deleteFridgeItem } from "./actions";
import { logout } from "../login/actions";
import { RecipeGenerator } from "./recipe-generator";

export const dynamic = "force-dynamic";

export default async function FridgePage() {
  const { data: items, error } = await supabase
    .from("fridge_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load fridge items: ${error.message}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8 py-32 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Fridge
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/fridge/saved"
              className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
            >
              Saved recipes
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <form action={addFridgeItem} className="flex gap-2">
          <Input name="name" placeholder="Item name" required className="flex-1" />
          <Input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="w-20"
          />
          <Button type="submit">Add</Button>
        </form>

        <ul className="flex flex-col gap-2">
          {items?.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-2 dark:border-zinc-800"
            >
              <span className="text-zinc-700 dark:text-zinc-300">
                {item.name} &times; {item.quantity}
              </span>
              <form action={deleteFridgeItem}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Delete
                </Button>
              </form>
            </li>
          ))}
          {items?.length === 0 && (
            <p className="text-zinc-500 dark:text-zinc-400">
              Your fridge is empty — add something above.
            </p>
          )}
        </ul>

        <RecipeGenerator />
      </main>
    </div>
  );
}
