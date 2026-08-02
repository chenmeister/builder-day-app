import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "site_auth";

function sitePassword(): string {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    throw new Error("Missing SITE_PASSWORD environment variable");
  }
  return password;
}

export function verifyPassword(password: string): boolean {
  const expected = Buffer.from(sitePassword());
  const input = Buffer.from(password);
  return input.length === expected.length && timingSafeEqual(input, expected);
}

/** Value the auth cookie must hold to be considered valid. */
export function authToken(): string {
  return createHash("sha256").update(sitePassword()).digest("hex");
}

/**
 * Belt-and-suspenders check for Server Actions: Proxy already blocks
 * unauthenticated requests, but Next.js recommends not relying on Proxy
 * alone since a matcher change could silently drop coverage.
 */
export async function requireAuth() {
  const store = await cookies();
  if (store.get(AUTH_COOKIE)?.value !== authToken()) {
    throw new Error("Unauthorized");
  }
}
