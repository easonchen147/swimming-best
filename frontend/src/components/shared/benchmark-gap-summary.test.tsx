import { render, screen } from "@testing-library/react";

import { BenchmarkGapSummary } from "@/components/shared/benchmark-gap-summary";

describe("BenchmarkGapSummary", () => {
  it("renders goal and official benchmark gaps together", () => {
    render(
      <BenchmarkGapSummary
        goals={[
          {
            id: "goal-1",
            title: "14 秒内",
            horizon: "short",
            targetTimeMs: 14000,
            targetDate: "2026-05-01",
            baselineTimeMs: 15000,
            currentBestTimeMs: 14600,
            progress: 0.4,
            gapMs: 600,
            isAchieved: false,
          },
        ]}
        officialBenchmarks={[
          {
            code: "level-2",
            label: "二级运动员",
            order: 2,
            qualifyingTimeMs: 14500,
            qualifyingTime: "14.50",
            achieved: false,
            gapMs: 100,
          },
        ]}
      />,
    );

    expect(screen.getByText("还差多少秒")).toBeInTheDocument();
    expect(screen.getByText("我的目标")).toBeInTheDocument();
    expect(screen.getByText("国家达级")).toBeInTheDocument();
    expect(screen.getByText("14 秒内")).toBeInTheDocument();
    expect(screen.getByText("二级运动员")).toBeInTheDocument();
    expect(screen.getAllByText(/还差/).length).toBeGreaterThan(1);
  });
});
