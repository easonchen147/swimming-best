import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  comparePublicEvent,
  getPublicArena,
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
    await listPublicSwimmers({ search: "海豚" });
    await listPublicSwimmers({ teamId: "team-1", search: "海豚" });
    await listPublicSwimmersByTeam();
    await listPublicSwimmersByTeam("team-1");
    await getPublicSwimmer("alice");
    await listPublicSwimmerEvents("alice");
    await getPublicEventAnalytics("alice", "event-1");
    await getPublicArena();
    await getPublicArena({ gender: "female", poolLengthM: 25, teamId: "team-1", ageBucket: "u12" });
    await comparePublicEvent("event-1", ["swimmer-a", "swimmer-b"]);

    expect(apiGet).toHaveBeenNthCalledWith(1, "/api/public/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(2, "/api/public/swimmers?search=%E6%B5%B7%E8%B1%9A");
    expect(apiGet).toHaveBeenNthCalledWith(3, "/api/public/swimmers?teamId=team-1&search=%E6%B5%B7%E8%B1%9A");
    expect(apiGet).toHaveBeenNthCalledWith(4, "/api/public/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(5, "/api/public/swimmers?teamId=team-1");
    expect(apiGet).toHaveBeenNthCalledWith(6, "/api/public/swimmers/alice");
    expect(apiGet).toHaveBeenNthCalledWith(
      7,
      "/api/public/swimmers/alice/events",
    );
    expect(apiGet).toHaveBeenNthCalledWith(
      8,
      "/api/public/swimmers/alice/events/event-1/analytics",
    );
    expect(apiGet).toHaveBeenNthCalledWith(
      9,
      "/api/public/arena",
    );
    expect(apiGet).toHaveBeenNthCalledWith(
      10,
      "/api/public/arena?gender=female&poolLengthM=25&teamId=team-1&ageBucket=u12",
    );
    expect(apiGet).toHaveBeenNthCalledWith(
      11,
      "/api/public/compare?eventId=event-1&swimmerId=swimmer-a&swimmerId=swimmer-b",
    );
  });
});
