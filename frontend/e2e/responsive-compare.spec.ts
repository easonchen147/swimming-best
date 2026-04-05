import { expect, test } from "@playwright/test";

async function mockCompareRoutes(page: import("@playwright/test").Page) {
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

  await page.route("**/api/public/swimmers/alice/events", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        events: [
          {
            event: {
              id: "event-1",
              poolLengthM: 25,
              distanceM: 50,
              stroke: "freestyle",
              effortType: "sprint",
              displayName: "50m 自由泳",
              sortOrder: 1,
              isActive: true,
            },
            currentBestTimeMs: 32000,
          },
        ],
      }),
      contentType: "application/json",
    });
  });

  await page.route("**/api/public/compare?*", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        event: {
          id: "event-1",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          effortType: "sprint",
          displayName: "50m 自由泳",
          sortOrder: 1,
          isActive: true,
        },
        swimmers: [
          {
            swimmerId: "swimmer-a",
            displayName: "Alice",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            series: {
              raw: [
                { performedOn: "2026-03-01", timeMs: 33000 },
                { performedOn: "2026-03-10", timeMs: 32000 },
              ],
              pb: [],
              trend: [],
              currentBestTimeMs: 32000,
            },
            currentBestTimeMs: 32000,
            improvementTimeMs: 1000,
            improvementRatio: 0.03,
          },
          {
            swimmerId: "swimmer-b",
            displayName: "Bella",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
            series: {
              raw: [
                { performedOn: "2026-03-01", timeMs: 32500 },
                { performedOn: "2026-03-10", timeMs: 31500 },
              ],
              pb: [],
              trend: [],
              currentBestTimeMs: 31500,
            },
            currentBestTimeMs: 31500,
            improvementTimeMs: 1000,
            improvementRatio: 0.03,
          },
        ],
      }),
      contentType: "application/json",
    });
  });
}

async function openCompareResults(page: import("@playwright/test").Page) {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: "进步对比分析" })).toBeVisible();
  await expect(page.getByText("待选对比成员")).toBeVisible();

  await page.getByRole("button", { name: "Alice" }).click();
  await page.getByRole("button", { name: "Bella" }).click();
  await expect(page.getByText("待选对比项目")).toBeVisible();

  await page.getByRole("combobox", { name: "对比项目" }).click();
  await page.getByRole("option", { name: "50m 自由泳" }).click();
  await expect(page.getByText("趋势走势对比")).toBeVisible();
}

test("compare chart supports interactive legend toggles", async ({ page }) => {
  await mockCompareRoutes(page);
  await openCompareResults(page);

  const bellaToggle = page.getByRole("button", { name: "切换 Bella 曲线" });
  await expect(bellaToggle).toHaveAttribute("aria-pressed", "true");
  await bellaToggle.click();
  await expect(bellaToggle).toHaveAttribute("aria-pressed", "false");
});

test("compare page stays within mobile and tablet viewport bounds", async ({ page }) => {
  await mockCompareRoutes(page);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
  ]) {
    await page.setViewportSize(viewport);
    await openCompareResults(page);

    const noOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth <= root.clientWidth + 1;
    });
    expect(noOverflow).toBe(true);
  }
});
