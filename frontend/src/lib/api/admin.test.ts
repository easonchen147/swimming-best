import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addContextPerformances,
  createAdminEvent,
  createAdminSwimmer,
  createAdminTeam,
  createContext,
  createGoal,
  getAdminMe,
  listAdminEvents,
  listAdminGoals,
  listAdminPerformances,
  listAdminSwimmers,
  listAdminTeams,
  loginAdmin,
  logoutAdmin,
  quickRecordPerformance,
  updateAdminSwimmer,
  updateAdminTeam,
} from "@/lib/api/admin";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiGet: vi.fn(async () => ({})),
  apiPost: vi.fn(async () => ({})),
  apiPatch: vi.fn(async () => ({})),
}));

describe("admin api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes admin reads through /api/admin", async () => {
    await getAdminMe();
    await listAdminTeams();
    await listAdminSwimmers();
    await listAdminSwimmers("team-1");
    await listAdminEvents();
    await listAdminGoals();
    await listAdminPerformances();

    expect(apiGet).toHaveBeenNthCalledWith(1, "/api/admin/me");
    expect(apiGet).toHaveBeenNthCalledWith(2, "/api/admin/teams");
    expect(apiGet).toHaveBeenNthCalledWith(3, "/api/admin/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(4, "/api/admin/swimmers?teamId=team-1");
    expect(apiGet).toHaveBeenNthCalledWith(5, "/api/admin/events");
    expect(apiGet).toHaveBeenNthCalledWith(6, "/api/admin/goals");
    expect(apiGet).toHaveBeenNthCalledWith(7, "/api/admin/performances");
  });

  it("routes admin writes through /api/admin", async () => {
    await loginAdmin({ username: "coach", password: "secret-pass" });
    await logoutAdmin();
    await createAdminTeam({ name: "海豚队", sortOrder: 1, isActive: true });
    await updateAdminTeam("team-1", { name: "海豚队 A", sortOrder: 2, isActive: false });
    await createAdminSwimmer({
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      teamId: "team-1",
    });
    await updateAdminSwimmer("swimmer-1", {
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      teamId: "team-2",
    });
    await createAdminEvent({
      poolLengthM: 25,
      distanceM: 50,
      stroke: "freestyle",
      effortType: "race",
      displayName: "50m 自由泳",
    });
    await quickRecordPerformance({
      swimmerId: "swimmer-1",
      eventId: "event-1",
      timeMs: 32000,
      sourceType: "competition",
      performedOn: "2026-04-02",
    });
    await createContext({
      sourceType: "training",
      title: "周三训练",
      performedOn: "2026-04-02",
      tags: ["月测"],
    });
    await addContextPerformances("context-1", [
      {
        swimmerId: "swimmer-1",
        eventId: "event-1",
        timeMs: 31900,
        resultStatus: "valid",
        tags: ["转身快"],
      },
    ]);
    await createGoal({
      swimmerId: "swimmer-1",
      eventId: "event-1",
      horizon: "short",
      title: "游进 31 秒",
      targetTimeMs: 31000,
      targetDate: "2026-05-01",
      isPublic: true,
    });

    expect(apiPost).toHaveBeenNthCalledWith(1, "/api/admin/login", {
      username: "coach",
      password: "secret-pass",
    });
    expect(apiPost).toHaveBeenNthCalledWith(2, "/api/admin/logout");
    expect(apiPost).toHaveBeenNthCalledWith(3, "/api/admin/teams", {
      name: "海豚队",
      sortOrder: 1,
      isActive: true,
    });
    expect(apiPatch).toHaveBeenNthCalledWith(1, "/api/admin/teams/team-1", {
      name: "海豚队 A",
      sortOrder: 2,
      isActive: false,
    });
    expect(apiPost).toHaveBeenNthCalledWith(4, "/api/admin/swimmers", {
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      teamId: "team-1",
    });
    expect(apiPatch).toHaveBeenNthCalledWith(2, "/api/admin/swimmers/swimmer-1", {
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      teamId: "team-2",
    });
    expect(apiPost).toHaveBeenNthCalledWith(5, "/api/admin/events", {
      poolLengthM: 25,
      distanceM: 50,
      stroke: "freestyle",
      effortType: "race",
      displayName: "50m 自由泳",
    });
    expect(apiPost).toHaveBeenNthCalledWith(6, "/api/admin/performances/quick", {
      swimmerId: "swimmer-1",
      eventId: "event-1",
      timeMs: 32000,
      sourceType: "competition",
      performedOn: "2026-04-02",
    });
    expect(apiPost).toHaveBeenNthCalledWith(7, "/api/admin/contexts", {
      sourceType: "training",
      title: "周三训练",
      performedOn: "2026-04-02",
      tags: ["月测"],
    });
    expect(apiPost).toHaveBeenNthCalledWith(8, "/api/admin/contexts/context-1/performances", {
      performances: [
        {
          swimmerId: "swimmer-1",
          eventId: "event-1",
          timeMs: 31900,
          resultStatus: "valid",
          tags: ["转身快"],
        },
      ],
    });
    expect(apiPost).toHaveBeenNthCalledWith(9, "/api/admin/goals", {
      swimmerId: "swimmer-1",
      eventId: "event-1",
      horizon: "short",
      title: "游进 31 秒",
      targetTimeMs: 31000,
      targetDate: "2026-05-01",
      isPublic: true,
    });
  });
});
