import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  user: null as null | { id: string },
  refresh: false,
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: { setAll: (items: unknown[]) => void } },
  ) => ({
    auth: {
      getUser: async () => {
        if (mocks.refresh)
          options.cookies.setAll([
            {
              name: "sb-test-auth-token",
              value: "refreshed",
              options: { path: "/", httpOnly: true },
            },
          ]);
        return { data: { user: mocks.user } };
      },
    },
  }),
}));
import { proxy, config } from "../proxy";
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test";
  mocks.user = null;
  mocks.refresh = false;
});
describe("public-page session continuity", () => {
  it("refreshes a homepage session and forwards the refreshed cookie without caching it", async () => {
    mocks.user = { id: "test-user" };
    mocks.refresh = true;
    const response = await proxy(
      new NextRequest("https://sakuga-anime.vercel.app/"),
    );
    expect(response.status).toBe(200);
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("refreshed");
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(
      "refreshed",
    );
  });
  it("matches homepage and discovery while excluding static artwork", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);
    expect(matcher.test("/")).toBe(true);
    expect(matcher.test("/discover")).toBe(true);
    expect(matcher.test("/anime/16498")).toBe(true);
    expect(matcher.test("/art/poster.jpg")).toBe(false);
  });
  it("preserves refresh cookie writes on a protected-page redirect", async () => {
    mocks.refresh = true;
    const response = await proxy(
      new NextRequest(
        "https://sakuga-anime.vercel.app/app/library?status=watching",
      ),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "next=%2Fapp%2Flibrary%3Fstatus%3Dwatching",
    );
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("refreshed");
  });
});
