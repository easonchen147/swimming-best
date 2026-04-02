import { describeSwimmer, listTeams } from "@/lib/swimmer-label";

describe("swimmer-label", () => {
  it("includes team name when present", () => {
    expect(
      describeSwimmer({
        nickname: "小海豚",
        realName: "Alice Wang",
        team: { id: "team-a", name: "海豚预备队" },
      }),
    ).toBe("小海豚 · 海豚预备队");
  });

  it("falls back to real name when nickname is empty", () => {
    expect(
      describeSwimmer({
        nickname: "",
        realName: "Alice Wang",
        team: undefined,
      }),
    ).toBe("Alice Wang");
  });

  it("lists unique teams with empty values removed", () => {
    expect(
      listTeams([
        { team: { id: "team-a", name: "海豚预备队", sortOrder: 2, isActive: true } },
        { team: { id: "team-b", name: "浪花竞速队", sortOrder: 1, isActive: true } },
        { team: { id: "team-a", name: "海豚预备队", sortOrder: 2, isActive: true } },
        { team: undefined },
      ]),
    ).toEqual([
      { id: "team-b", name: "浪花竞速队", sortOrder: 1, isActive: true },
      { id: "team-a", name: "海豚预备队", sortOrder: 2, isActive: true },
    ]);
  });
});
