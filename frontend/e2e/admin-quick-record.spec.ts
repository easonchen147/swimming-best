import { expect, test } from "@playwright/test";

test("admin quick record modal supports keyboard-first entry", async ({ page }) => {
  let postedBody: Record<string, unknown> | null = null;

  await page.route("**/api/admin/me", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ username: "admin" }),
      contentType: "application/json",
    });
  });
  await page.route("**/api/admin/teams", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ teams: [] }),
      contentType: "application/json",
    });
  });
  await page.route("**/api/admin/swimmers*", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        swimmers: [
          {
            id: "swimmer-1",
            slug: "alice",
            realName: "Alice Wang",
            nickname: "小海豚",
            publicNameMode: "nickname",
            isPublic: true,
            gender: "female",
            teamId: "team-1",
            team: { id: "team-1", name: "海豚队", sortOrder: 1, isActive: true },
          },
        ],
      }),
      contentType: "application/json",
    });
  });
  await page.route("**/api/admin/events*", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        events: [
          {
            id: "event-1",
            poolLengthM: 25,
            distanceM: 50,
            stroke: "freestyle",
            effortType: "sprint",
            displayName: "50m 自由泳",
            sortOrder: 1,
            isActive: true,
          },
        ],
      }),
      contentType: "application/json",
    });
  });
  await page.route("**/api/admin/performances/quick", async (route) => {
    postedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      body: JSON.stringify({}),
      contentType: "application/json",
    });
  });

  await page.goto("/admin");
  await page.keyboard.press("Control+K");

  await expect(page.getByText("快速成绩录入")).toBeVisible();
  await page.getByLabel("标签（分号或逗号分隔）").fill("月测;主项");
  await page.getByRole("button", { name: "立即保存" }).click();

  await expect.poll(() => postedBody?.tags).toEqual(["月测", "主项"]);
});
