import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiGet, apiPost, clientNavigation } from "@/lib/api/client";

describe("api client unauthorized handling", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const replaceMock = vi.spyOn(clientNavigation, "replace").mockImplementation(() => {});

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    replaceMock.mockClear();
    window.history.replaceState({}, "", "/admin");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("redirects admin unauthorized reads to the login page without surfacing a runtime rejection", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    let settled: "resolved" | "rejected" | null = null;
    void apiGet("/api/admin/me").then(
      () => {
        settled = "resolved";
      },
      () => {
        settled = "rejected";
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(replaceMock).toHaveBeenCalledWith("/admin/login");
    expect(settled).toBeNull();
  });

  it("preserves login form invalid_credentials errors without redirecting", async () => {
    window.history.replaceState({}, "", "/admin/login");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      apiPost("/api/admin/login", { username: "admin", password: "wrong" }),
    ).rejects.toThrow("invalid_credentials");
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
