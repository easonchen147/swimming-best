import { render, screen } from "@testing-library/react";

import { ImprovementChart } from "@/components/charts/improvement-chart";

describe("ImprovementChart", () => {
  it("renders a benchmark-aware growth chart", () => {
    render(
      <ImprovementChart
        benchmarkLines={[
          {
            name: "A 组达标",
            tierGroup: "暑期集训",
            colorHex: "#3b82f6",
            qualifyingTimeMs: 14800,
          },
        ]}
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
        pb={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14600 },
        ]}
        raw={[
          { performedOn: "2026-03-01", timeMs: 15000, sourceType: "test" },
          { performedOn: "2026-03-08", timeMs: 14600, sourceType: "competition" },
        ]}
      />,
    );

    expect(screen.getByText("成长曲线")).toBeInTheDocument();
    expect(screen.getByText("国家达级")).toBeInTheDocument();
    expect(screen.getByText("二级运动员")).toBeInTheDocument();
    expect(screen.getByText("14 秒内")).toBeInTheDocument();
    expect(screen.getByText("A 组达标")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<ImprovementChart raw={[]} />);

    expect(screen.getByText("暂无成绩数据")).toBeInTheDocument();
  });
});
