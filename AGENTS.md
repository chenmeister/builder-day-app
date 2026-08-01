# Workshop rules (Claude Builder Day)

These apply to every change in `builder-day-app`, including work that goes beyond the class guide:

- **Database changes go through migration files.** Create each change with `npx supabase migration new <short_description>`; append a new migration rather than editing one that's been pushed, and show the SQL for approval before running `npx supabase db push`.
- **Every new table gets Row Level Security enabled, with no policies.** The app reads data on the server using the secret key; the public Data API stays locked.
- **Secrets stay server-side.** `SUPABASE_SECRET_KEY` lives in `builder-day-app/.env`: keep it out of output and logs, out of git, and out of client components — `lib/supabase.ts` enforces this with `import "server-only"`, so route all database access through it.

## Frontend conventions

- **UI components come from shadcn/ui.** If `components.json` doesn't exist yet, run `npx shadcn@latest init` first. Add components on demand with `npx shadcn@latest add <component>` rather than pre-installing the whole set. Prefer a shadcn component over a hand-rolled equivalent when one exists (button, input, dialog, card, etc.).
- **Icons come from `lucide-react`** (shadcn's default — installed by `shadcn init`).
- **Forms use `react-hook-form` + `zod`** (+ `@hookform/resolvers`), wired through shadcn's `<Form>` component. Validate with a zod schema rather than ad-hoc checks.
- **Action feedback uses `sonner`** for toasts (e.g. "Saved", "Something went wrong") instead of `alert()` or silent failures.

## Next.js routing conventions

- **App Router only.** `builder-day-app` uses `app/`, not the legacy Pages Router — never create a `pages/` directory; all routes and layouts live under `app/`.
- **Reads are Server Components.** Query Supabase directly inside an async Server Component (the way `app/page.tsx` does) and render the result straight from the query — no API route needed for that.
- **Writes are Server Actions, not API routes.** A `"use server"` function called from a form covers inserts/updates/deletes while keeping the secret key server-side (see the "Insert from the app" stretch goal in the class guide). Server Actions also accept `FormData`/file uploads directly, so this covers most write paths, including uploading a recording or a photo.
- **Reach for an API route (`app/api/<name>/route.ts`) only when something outside this app's own React tree needs to call in**: a webhook from a third-party service, an endpoint for a non-browser client (mobile app, cron job, CLI), or custom streaming/response control a Server Action can't give you. Until one of those is actually true, you don't need one.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

`builder-day-app` runs a Next.js version with breaking changes — APIs, conventions, and file structure may all differ from your training data. Before writing any code in `builder-day-app`, read the relevant guide in `builder-day-app/node_modules/next/dist/docs/`. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
