import { expect, test } from "@playwright/test";

async function mockArenaRoutes(page: import("@playwright/test").Page) {
  await page.route("**/api/public/arena*", async (route) => {
    const url = new URL(route.request().url());
    const gender = url.searchParams.get("gender");
    const poolLengthM = url.searchParams.get("poolLengthM");

    const allGroups = [
      {
        groupKey: "event-1:male:all",
        gender: "male",
        ageBucket: "all",
        event: {
          id: "event-1",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          effortType: "standard",
          displayName: "50米 自由泳（短池）",
          sortOrder: 1,
          isActive: true,
        },
        competitorCount: 2,
        heatScore: 78,
        heatLabel: "激烈",
        leaderGapMs: 500,
        leaderGapPercent: 0.015,
        leader: {
          swimmerId: "swimmer-a",
          displayName: "男甲",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
          bestTimeMs: 32000,
        },
        rankings: [
          {
            rank: 1,
            swimmerId: "swimmer-a",
            displayName: "男甲",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            ageBucket: "all",
            bestTimeMs: 32000,
            gapFromLeaderMs: 0,
          },
          {
            rank: 2,
            swimmerId: "swimmer-b",
            displayName: "男乙",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
            ageBucket: "all",
            bestTimeMs: 32500,
            gapFromLeaderMs: 500,
          },
        ],
      },
      {
        groupKey: "event-2:female:u12",
        gender: "female",
        ageBucket: "u12",
        event: {
          id: "event-2",
          poolLengthM: 50,
          distanceM: 100,
          stroke: "backstroke",
          effortType: "standard",
          displayName: "100米 仰泳（长池）",
          sortOrder: 2,
          isActive: true,
        },
        competitorCount: 1,
        heatScore: 28,
        heatLabel: "观察",
        leaderGapMs: 0,
        leaderGapPercent: 0,
        leader: {
          swimmerId: "swimmer-c",
          displayName: "女乙",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
          bestTimeMs: 71500,
        },
        rankings: [
          {
            rank: 1,
            swimmerId: "swimmer-c",
            displayName: "女乙",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            ageBucket: "u12",
            bestTimeMs: 71500,
            gapFromLeaderMs: 0,
          },
        ],
      },
      {
        groupKey: "event-3:male:u11",
        gender: "male",
        ageBucket: "u11",
        event: {
          id: "event-3",
          poolLengthM: 50,
          distanceM: 100,
          stroke: "backstroke",
          effortType: "standard",
          displayName: "100米 仰泳（长池）",
          sortOrder: 3,
          isActive: true,
        },
        competitorCount: 1,
        heatScore: 24,
        heatLabel: "观察",
        leaderGapMs: 0,
        leaderGapPercent: 0,
        leader: {
          swimmerId: "swimmer-d",
          displayName: "男丙",
          teamId: "team-b",
          team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
          bestTimeMs: 70500,
        },
        rankings: [
          {
            rank: 1,
            swimmerId: "swimmer-d",
            displayName: "男丙",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
            ageBucket: "u11",
            bestTimeMs: 70500,
            gapFromLeaderMs: 0,
          },
        ],
      },
    ];

    const groups = allGroups.filter((group) => {
      const genderMatched = !gender || group.gender === gender;
      const poolMatched = !poolLengthM || String(group.event.poolLengthM) === poolLengthM;
      return genderMatched && poolMatched;
    });

    await route.fulfill({
      body: JSON.stringify({
        filters: {
          gender: gender ?? "all",
          poolLengthM: poolLengthM ? Number(poolLengthM) : undefined,
          teamId: "",
          ageBucket: "all",
        },
        summary: {
          groupCount: groups.length,
          competitorCount: groups.reduce((sum, group) => sum + group.competitorCount, 0),
        },
        groups,
      }),
      contentType: "application/json",
    });
  });
}

async function openArena(page: import("@playwright/test").Page) {
  await page.goto("/arena");
  await expect(page.getByRole("heading", { name: "竞技场" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "赛道详情" })).toBeVisible();
}

async function selectOption(
  page: import("@playwright/test").Page,
  label: string,
  option: string,
) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("arena board supports the new three-dropdown filter flow", async ({ page }) => {
  await mockArenaRoutes(page);
  await openArena(page);

  await expect(page.getByText(/当前头名 男甲/)).toBeVisible();
  await expect(page.getByText("当前赛道热度")).toBeVisible();
  await expect(page.getByText("TOP 1")).toBeVisible();

  await selectOption(page, "性别筛选", "女子");
  await expect(page.getByText(/当前头名 女乙/)).toBeVisible();

  await selectOption(page, "池长筛选", "50米长池");
  await expect(page.getByRole("combobox", { name: "池长筛选" })).toContainText("50米长池");

  await selectOption(page, "项目筛选", "100米 仰泳");
  await expect(page.getByRole("combobox", { name: "项目筛选" })).toContainText("100米 仰泳");
  await expect(page.getByText("女乙")).toBeVisible();
});

test("arena page stays within mobile and tablet viewport bounds", async ({ page }) => {
  await mockArenaRoutes(page);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
  ]) {
    await page.setViewportSize(viewport);
    await openArena(page);

    const noOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth <= root.clientWidth + 1;
    });
    expect(noOverflow).toBe(true);
  }
});
