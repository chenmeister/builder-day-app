import { describe, it, expect, vi, beforeEach } from "vitest";

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

const { cookieStore, redirect, verifyPassword, authToken } = vi.hoisted(
  () => ({
    cookieStore: { set: vi.fn(), delete: vi.fn() },
    redirect: vi.fn((url: string) => {
      throw new RedirectSignal(url);
    }),
    verifyPassword: vi.fn(),
    authToken: vi.fn(() => "the-auth-token"),
  })
);

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth", () => ({
  AUTH_COOKIE: "site_auth",
  authToken,
  verifyPassword,
}));

import { login, logout } from "./actions";

function formDataWith(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("login server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authToken.mockReturnValue("the-auth-token");
  });

  it("sets the auth cookie and redirects to `next` on a correct password", async () => {
    verifyPassword.mockReturnValue(true);
    const formData = formDataWith({ password: "right", next: "/fridge" });

    await expect(login(formData)).rejects.toMatchObject({ url: "/fridge" });

    expect(cookieStore.set).toHaveBeenCalledWith(
      "site_auth",
      "the-auth-token",
      expect.objectContaining({ httpOnly: true, secure: true })
    );
  });

  it("redirects to /login with an error and does not set a cookie on a wrong password", async () => {
    verifyPassword.mockReturnValue(false);
    const formData = formDataWith({ password: "wrong", next: "/fridge" });

    await expect(login(formData)).rejects.toMatchObject({
      url: "/login?error=1&next=%2Ffridge",
    });

    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects a `next` value that isn't a same-site path", async () => {
    verifyPassword.mockReturnValue(true);
    const formData = formDataWith({
      password: "right",
      next: "https://evil.example.com",
    });

    await expect(login(formData)).rejects.toMatchObject({
      url: "/login?error=1&next=https%3A%2F%2Fevil.example.com",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects a protocol-relative `next` value (open redirect)", async () => {
    verifyPassword.mockReturnValue(true);
    const formData = formDataWith({
      password: "right",
      next: "//evil.example.com",
    });

    await expect(login(formData)).rejects.toMatchObject({
      url: "/login?error=1&next=%2F%2Fevil.example.com",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects a backslash-prefixed `next` value (open redirect)", async () => {
    verifyPassword.mockReturnValue(true);
    const formData = formDataWith({
      password: "right",
      next: "/\\evil.example.com",
    });

    await expect(login(formData)).rejects.toMatchObject({
      url: "/login?error=1&next=%2F%5Cevil.example.com",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("defaults `next` to / when omitted", async () => {
    verifyPassword.mockReturnValue(true);
    const formData = formDataWith({ password: "right" });

    await expect(login(formData)).rejects.toMatchObject({ url: "/" });
  });
});

describe("logout server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the auth cookie and redirects to /login", async () => {
    await expect(logout()).rejects.toMatchObject({ url: "/login" });
    expect(cookieStore.delete).toHaveBeenCalledWith("site_auth");
  });
});
