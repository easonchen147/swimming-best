import { render, screen } from "@testing-library/react";

import { SwimmerSummaryReport } from "@/components/export/swimmer-summary-report";

describe("SwimmerSummaryReport", () => {
  it("renders swimmer highlights and goal summary", () => {
    render(
      <SwimmerSummaryReport
        summary={{
          swimmer: {
            id: "swimmer-1",
            realName: "Alice Wang",
            nickname: "小海豚",
            displayName: "小海豚",
            gender: "female",
            birthYear: 2014,
            ageBucket: "u12",
            teamId: "team-1",
            team: {
              id: "team-1",
              name: "海豚预备队",
              sortOrder: 1,
              isActive: true,
            },
          },
          summary: {
            strongestEventCount: 2,
            achievedGoalCount: 1,
            activeGoalCount: 2,
            standoutProgress30dMs: 500,
            standoutProgress90dMs: 1200,
          },
          highlights: [
            {
              eventId: "event-1",
              eventDisplayName: "50米 自由泳（短池）",
              bestTimeMs: 32000,
              officialGradeLabel: "二级",
              nextOfficialGradeLabel: "一级",
              nextOfficialGradeGapMs: 800,
              progress30dMs: 500,
              progress90dMs: 1200,
            },
          ],
          goals: [
            {
              id: "goal-1",
              title: "暑假前游进 31.50",
              horizon: "short",
              targetTimeMs: 31500,
              targetDate: "2026-08-01",
              baselineTimeMs: 33500,
              currentBestTimeMs: 32000,
              progress: 0.75,
              gapMs: 500,
              isAchieved: false,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("成绩简报模板")).toBeInTheDocument();
    expect(screen.getByText("50米 自由泳（短池）")).toBeInTheDocument();
    expect(screen.getByText("国家等级：二级")).toBeInTheDocument();
    expect(screen.getByText(/还差 0.50s/)).toBeInTheDocument();
  });
});
