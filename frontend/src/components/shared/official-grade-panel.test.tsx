import { render, screen } from "@testing-library/react";

import { OfficialGradePanel } from "@/components/shared/official-grade-panel";

describe("OfficialGradePanel", () => {
  it("renders current grade and next gap when official evaluation is available", () => {
    render(
      <OfficialGradePanel
        nextOfficialGrade={{
          code: "level1",
          gapMs: 2300,
          label: "一级运动员",
          order: 3,
          qualifyingTime: "23.60",
          qualifyingTimeMs: 23600,
        }}
        officialGrade={{
          code: "level2",
          label: "二级运动员",
          order: 2,
          qualifyingTime: "26.50",
          qualifyingTimeMs: 26500,
        }}
        status="ok"
      />,
    );

    expect(screen.getByText("官方达级标准")).toBeInTheDocument();
    expect(screen.getByText("二级运动员")).toBeInTheDocument();
    expect(screen.getByText(/一级运动员/)).toBeInTheDocument();
    expect(screen.getByText(/2.30s/)).toBeInTheDocument();
  });

  it("renders fallback hints for missing gender", () => {
    render(
      <OfficialGradePanel
        nextOfficialGrade={null}
        officialGrade={null}
        status="missing_gender"
      />,
    );

    expect(
      screen.getByText("补充学员性别信息后可自动计算官方达级状态。"),
    ).toBeInTheDocument();
  });
});
