import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addContextPerformances,
  createAdminEvent,
  createAdminStandard,
  createAdminStandardEntry,
  createAdminSwimmer,
  createAdminTeam,
  createContext,
  createGoal,
  deleteAdminStandard,
  deleteAdminStandardEntry,
  getAdminMe,
  getSwimmerSummaryExport,
  getSwimmerSummaryExportUrl,
  listAdminEvents,
  listAdminGoals,
  listAdminPerformances,
  listAdminStandardEntries,
  listAdminStandards,
  listAdminSwimmers,
  listAdminTeams,
  loginAdmin,
  logoutAdmin,
  quickRecordPerformance,
  updateAdminStandard,
  updateAdminStandardEntry,
  updateAdminSwimmer,
  updateAdminTeam,
} from "@/lib/api/admin";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiGet: vi.fn(async () => ({})),
  apiPost: vi.fn(async () => ({})),
  apiPatch: vi.fn(async () => ({})),
  apiDelete: vi.fn(async () => undefined),
}));

describe("admin api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes admin reads through /api/admin", async () => {
    await getAdminMe();
    await listAdminTeams();
    await listAdminTeams("冲刺");
    await listAdminSwimmers();
    await listAdminSwimmers("team-1");
    await listAdminSwimmers("team-1", "海豚");
    await listAdminEvents();
    await listAdminEvents("自由泳");
    await listAdminGoals();
    await listAdminPerformances();
    await listAdminStandards();
    await listAdminStandardEntries("standard-1");
    await getSwimmerSummaryExport("swimmer-1");

    expect(apiGet).toHaveBeenNthCalledWith(1, "/api/admin/me");
    expect(apiGet).toHaveBeenNthCalledWith(2, "/api/admin/teams");
    expect(apiGet).toHaveBeenNthCalledWith(3, "/api/admin/teams?search=%E5%86%B2%E5%88%BA");
    expect(apiGet).toHaveBeenNthCalledWith(4, "/api/admin/swimmers");
    expect(apiGet).toHaveBeenNthCalledWith(5, "/api/admin/swimmers?teamId=team-1");
    expect(apiGet).toHaveBeenNthCalledWith(6, "/api/admin/swimmers?teamId=team-1&search=%E6%B5%B7%E8%B1%9A");
    expect(apiGet).toHaveBeenNthCalledWith(7, "/api/admin/events");
    expect(apiGet).toHaveBeenNthCalledWith(8, "/api/admin/events?search=%E8%87%AA%E7%94%B1%E6%B3%B3");
    expect(apiGet).toHaveBeenNthCalledWith(9, "/api/admin/goals");
    expect(apiGet).toHaveBeenNthCalledWith(10, "/api/admin/performances");
    expect(apiGet).toHaveBeenNthCalledWith(11, "/api/admin/standards");
    expect(apiGet).toHaveBeenNthCalledWith(12, "/api/admin/standards/standard-1/entries");
    expect(apiGet).toHaveBeenNthCalledWith(13, "/api/admin/export/swimmers/swimmer-1/summary");
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
      gender: "male",
      teamId: "team-1",
      birthDate: "2016-05-12",
    });
    await updateAdminSwimmer("swimmer-1", {
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      gender: "female",
      teamId: "team-2",
      birthDate: "2016-05-13",
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
    await createAdminStandard({
      tierGroup: "暑期集训线",
      name: "A组达标",
      tierOrder: 2,
      colorHex: "#3b82f6",
    });
    await updateAdminStandard("standard-1", {
      name: "A组冲线",
      tierOrder: 3,
    });
    await createAdminStandardEntry("standard-1", {
      eventId: "event-1",
      gender: "male",
      qualifyingTimeMs: 25000,
    });
    await updateAdminStandardEntry("entry-1", {
      gender: "all",
      qualifyingTimeMs: 25500,
    });
    await deleteAdminStandardEntry("entry-1");
    await deleteAdminStandard("standard-1");

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
      gender: "male",
      teamId: "team-1",
      birthDate: "2016-05-12",
    });
    expect(apiPatch).toHaveBeenNthCalledWith(2, "/api/admin/swimmers/swimmer-1", {
      realName: "Alice Wang",
      nickname: "小海豚",
      publicNameMode: "nickname",
      isPublic: true,
      gender: "female",
      teamId: "team-2",
      birthDate: "2016-05-13",
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
    expect(apiPost).toHaveBeenNthCalledWith(10, "/api/admin/standards", {
      tierGroup: "暑期集训线",
      name: "A组达标",
      tierOrder: 2,
      colorHex: "#3b82f6",
    });
    expect(apiPatch).toHaveBeenNthCalledWith(3, "/api/admin/standards/standard-1", {
      name: "A组冲线",
      tierOrder: 3,
    });
    expect(apiPost).toHaveBeenNthCalledWith(11, "/api/admin/standards/standard-1/entries", {
      eventId: "event-1",
      gender: "male",
      qualifyingTimeMs: 25000,
    });
    expect(apiPatch).toHaveBeenNthCalledWith(4, "/api/admin/standards/entries/entry-1", {
      gender: "all",
      qualifyingTimeMs: 25500,
    });
    expect(apiDelete).toHaveBeenNthCalledWith(1, "/api/admin/standards/entries/entry-1");
    expect(apiDelete).toHaveBeenNthCalledWith(2, "/api/admin/standards/standard-1");
  });

  it("builds swimmer summary export urls", () => {
    expect(getSwimmerSummaryExportUrl("swimmer-1")).toBe(
      "/admin/export/swimmers/swimmer-1/summary",
    );
  });
});
