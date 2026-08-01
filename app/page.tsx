import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load ideas: ${error.message}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Ideas
        </h1>
        <ul className="w-full max-w-md list-disc space-y-3 pl-6 text-lg text-zinc-700 dark:text-zinc-300">
          {ideas?.map((idea) => <li key={idea.id}>{idea.title}</li>)}
        </ul>
      </main>
    </div>
  );
}
