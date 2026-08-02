import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHash } from "node:crypto";

const { cookies } = vi.hoisted(() => ({
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies }));

import { AUTH_COOKIE, verifyPassword, authToken, requireAuth } from "./auth";

describe("lib/auth", () => {
  const originalPassword = process.env.SITE_PASSWORD;

  beforeEach(() => {
    process.env.SITE_PASSWORD = "correct-horse-battery-staple";
  });

  afterEach(() => {
    process.env.SITE_PASSWORD = originalPassword;
    vi.clearAllMocks();
  });

  describe("verifyPassword", () => {
    it("returns true for the correct password", () => {
      expect(verifyPassword("correct-horse-battery-staple")).toBe(true);
    });

    it("returns false for an incorrect password", () => {
      expect(verifyPassword("wrong")).toBe(false);
    });

    it("returns false when the input is a different length than expected", () => {
      expect(verifyPassword("correct-horse-battery-staple-extra")).toBe(
        false
      );
    });

    it("throws when SITE_PASSWORD is not configured", () => {
      delete process.env.SITE_PASSWORD;
      expect(() => verifyPassword("anything")).toThrow(
        "Missing SITE_PASSWORD environment variable"
      );
    });
  });

  describe("authToken", () => {
    it("returns the sha256 hex digest of the site password", () => {
      const expected = createHash("sha256")
        .update("correct-horse-battery-staple")
        .digest("hex");
      expect(authToken()).toBe(expected);
    });

    it("changes when the site password changes", () => {
      const first = authToken();
      process.env.SITE_PASSWORD = "a-different-password";
      expect(authToken()).not.toBe(first);
    });
  });

  describe("requireAuth", () => {
    it("resolves when the auth cookie matches the expected token", async () => {
      cookies.mockResolvedValue({
        get: (name: string) =>
          name === AUTH_COOKIE ? { value: authToken() } : undefined,
      });

      await expect(requireAuth()).resolves.toBeUndefined();
    });

    it("throws when the auth cookie is missing", async () => {
      cookies.mockResolvedValue({ get: () => undefined });

      await expect(requireAuth()).rejects.toThrow("Unauthorized");
    });

    it("throws when the auth cookie value does not match", async () => {
      cookies.mockResolvedValue({
        get: (name: string) =>
          name === AUTH_COOKIE ? { value: "stale-token" } : undefined,
      });

      await expect(requireAuth()).rejects.toThrow("Unauthorized");
    });
  });
});
