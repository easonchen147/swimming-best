import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  comparePublicEvent,
  getPublicEventAnalytics,
  getPublicSwimmer,
  listPublicSwimmerEvents,
  listPublicSwimmers,
  listPublicSwimmersByTeam,
} from "@/lib/api/public";
import { apiGet } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiGet: vi.fn(async () => ({})),
}));

describe("public api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes public reads through /api/public", async () => {
    await listPublicSwimmers();
    await listPublicSwimmersByTeam();
    await listPublicSwimmersByTeam("team-1");
    await getPublicSwimmer("alice");
    await listPublicSwimmerEvents("alice");
    await getPublicEventAnalytics("alice", "event-1");
    await comparePublicEvent("event-1", ["swimmer-1", "swimmer-2"]);

    expect(apiGet).toHaveBeenNthCalledWith(1, "/api/public/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(2, "/api/public/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(3, "/api/public/swimmers?teamId=team-1");
    expect(apiGet).toHaveBeenNthCalledWith(4, "/api/public/swimmers/alice");
    expect(apiGet).toHaveBeenNthCalledWith(5, "/api/public/swimmers/alice/events");
    expect(apiGet).toHaveBeenNthCalledWith(
      6,
      "/api/public/swimmers/alice/events/event-1/analytics",
    );
    expect(apiGet).toHaveBeenNthCalledWith(
      7,
      "/api/public/compare?eventId=event-1&swimmerId=swimmer-1&swimmerId=swimmer-2",
    );
  });
});
