import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authToken } = vi.hoisted(() => ({
  authToken: vi.fn(() => "expected-token"),
}));

vi.mock("@/lib/auth", () => ({
  AUTH_COOKIE: "site_auth",
  authToken,
}));

import { proxy } from "./proxy";

describe("proxy", () => {
  beforeEach(() => {
    authToken.mockReturnValue("expected-token");
  });

  it("lets /login through without checking the auth cookie", () => {
    const request = new NextRequest("http://localhost/login");

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(authToken).not.toHaveBeenCalled();
  });

  it("redirects to /login with a `next` param when there is no auth cookie", () => {
    const request = new NextRequest("http://localhost/fridge");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Ffridge"
    );
  });

  it("redirects to /login when the auth cookie value is wrong", () => {
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: "site_auth=stale-token" },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2F"
    );
  });

  it("passes the request through when the auth cookie matches", () => {
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: "site_auth=expected-token" },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});
