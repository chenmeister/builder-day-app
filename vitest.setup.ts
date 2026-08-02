import { vi } from "vitest";

// The real `server-only` package throws unless bundled under React's
// "react-server" condition, which Vitest doesn't set. Stub it so
// server-only modules (lib/auth.ts, lib/supabase.ts) can be imported here.
vi.mock("server-only", () => ({}));
