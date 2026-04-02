import { render, screen } from "@testing-library/react";

import { ImprovementChart } from "@/components/charts/improvement-chart";

describe("ImprovementChart", () => {
  it("renders the chart heading", () => {
    render(
      <ImprovementChart
        pb={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14900 },
        ]}
        raw={[
          { performedOn: "2026-03-01", timeMs: 15000 },
          { performedOn: "2026-03-08", timeMs: 14900 },
        ]}
      />,
    );

    expect(screen.getByText("进步幅度")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<ImprovementChart pb={[]} raw={[]} />);

    expect(screen.getByText("暂无成绩数据")).toBeInTheDocument();
  });
});
