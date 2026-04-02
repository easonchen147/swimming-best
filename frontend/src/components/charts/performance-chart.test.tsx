import { render, screen } from "@testing-library/react";

import { PerformanceChart } from "@/components/charts/performance-chart";

describe("PerformanceChart", () => {
  it("renders the chart heading", () => {
    render(
      <PerformanceChart
        pb={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14900 },
        ]}
        raw={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14900 },
        ]}
        trend={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14950 },
        ]}
      />,
    );

    expect(screen.getByText("成绩波动、PB 包络线与趋势")).toBeInTheDocument();
  });
});
