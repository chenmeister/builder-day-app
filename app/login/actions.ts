"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_COOKIE, authToken, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  password: z.string().min(1),
  // Must be a same-site relative path. Reject "//host" and "/\host", which
  // browsers resolve as protocol-relative absolute URLs (open redirect).
  next: z
    .string()
    .regex(/^\/(?!\/|\\)/)
    .default("/"),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
    next: formData.get("next") || "/",
  });

  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    redirect(`/login?error=1&next=${encodeURIComponent(
      typeof formData.get("next") === "string" ? String(formData.get("next")) : "/"
    )}`);
  }

  const store = await cookies();
  store.set(AUTH_COOKIE, authToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(parsed.data.next);
}

export async function logout() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}
