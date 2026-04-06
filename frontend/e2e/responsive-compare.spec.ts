import { expect, test } from "@playwright/test";

async function mockArenaRoutes(page: import("@playwright/test").Page) {
  await page.route("**/api/public/swimmers", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        swimmers: [
          {
            id: "swimmer-a",
            slug: "alice",
            displayName: "Alice",
            strongestEventId: "event-1",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
          },
          {
            id: "swimmer-b",
            slug: "bella",
            displayName: "Bella",
            strongestEventId: "event-1",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
          },
        ],
      }),
      contentType: "application/json",
    });
  });

  await page.route("**/api/public/arena*", async (route) => {
    const url = new URL(route.request().url());
    const gender = url.searchParams.get("gender");
    const allGroups = [
      {
        groupKey: "event-1:male",
        gender: "male",
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
          displayName: "男A",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
          bestTimeMs: 32000,
        },
        rankings: [
          {
            rank: 1,
            swimmerId: "swimmer-a",
            displayName: "男A",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 32000,
            gapFromLeaderMs: 0,
          },
          {
            rank: 2,
            swimmerId: "swimmer-b",
            displayName: "男B",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
            bestTimeMs: 32500,
            gapFromLeaderMs: 500,
          },
        ],
      },
      {
        groupKey: "event-2:female",
        gender: "female",
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
          displayName: "女A",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
          bestTimeMs: 71500,
        },
        rankings: [
          {
            rank: 1,
            swimmerId: "swimmer-c",
            displayName: "女A",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 71500,
            gapFromLeaderMs: 0,
          },
        ],
      },
    ];
    const groups = gender ? allGroups.filter((group) => group.gender === gender) : allGroups;

    await route.fulfill({
      body: JSON.stringify({
        filters: { gender: gender ?? "all", poolLengthM: undefined, teamId: "" },
        summary: {
          arenaCount: groups.length,
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
  await expect(page.getByText("赛道热力板")).toBeVisible();
}

test("arena board supports filter-driven drill-down", async ({ page }) => {
  await mockArenaRoutes(page);
  await openArena(page);

  await expect(page.getByText("男A", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "女子" }).click();
  await expect(page.getByText("女A", { exact: true })).toBeVisible();
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
