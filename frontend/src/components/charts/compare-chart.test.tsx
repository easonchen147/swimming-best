import { fireEvent, render, screen } from "@testing-library/react";

import { CompareChart } from "@/components/charts/compare-chart";

describe("CompareChart", () => {
  it("renders legend toggles for swimmers", () => {
    render(
      <CompareChart
        swimmers={[
          {
            swimmerId: "swimmer-a",
            displayName: "Alice",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚队", sortOrder: 1, isActive: true },
            series: {
              raw: [{ performedOn: "2026-03-01", timeMs: 32000 }],
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
            team: { id: "team-b", name: "浪花队", sortOrder: 2, isActive: true },
            series: {
              raw: [{ performedOn: "2026-03-01", timeMs: 31500 }],
              pb: [],
              trend: [],
              currentBestTimeMs: 31500,
            },
            currentBestTimeMs: 31500,
            improvementTimeMs: 1500,
            improvementRatio: 0.05,
          },
        ]}
      />,
    );

    expect(screen.getByText("进步曲线对比")).toBeInTheDocument();
    const bellaToggle = screen.getByRole("button", { name: "切换 Bella 曲线" });
    expect(bellaToggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(bellaToggle);
    expect(bellaToggle).toHaveAttribute("aria-pressed", "false");
  });
});
