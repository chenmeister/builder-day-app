import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-6 px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Sign in
        </h1>

        <form action={login} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            autoFocus
            required
          />
          <Button type="submit">Continue</Button>
        </form>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Wrong password.
          </p>
        )}
      </main>
    </div>
  );
}
