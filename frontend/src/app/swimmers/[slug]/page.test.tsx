import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import SwimmerDetailPage from "@/app/swimmers/[slug]/page";

const getPublicSwimmer = vi.fn();
const listPublicSwimmerEvents = vi.fn();
const getPublicEventAnalytics = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "tester" }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/layout/public-shell", () => ({
  PublicShell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/shared/public-event-analytics-view", () => ({
  PublicEventAnalyticsView: () => <div>成长曲线模块</div>,
}));

vi.mock("@/lib/api/public", () => ({
  getPublicSwimmer: (...args: unknown[]) => getPublicSwimmer(...args),
  listPublicSwimmerEvents: (...args: unknown[]) => listPublicSwimmerEvents(...args),
  getPublicEventAnalytics: (...args: unknown[]) => getPublicEventAnalytics(...args),
}));

describe("SwimmerDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getPublicSwimmer.mockResolvedValue({
      id: "swimmer-1",
      slug: "tester",
      displayName: "测试队员",
      teamId: "team-1",
      team: { id: "team-1", name: "海豚预备队", sortOrder: 1, isActive: true },
      gender: "male",
    });

    listPublicSwimmerEvents.mockResolvedValue({
      events: [
        {
          event: {
            id: "event-1",
            poolLengthM: 25,
            distanceM: 50,
            stroke: "freestyle",
            displayName: "50米 自由泳（短池）",
            sortOrder: 1,
            isActive: true,
          },
          currentBestTimeMs: 32000,
        },
      ],
    });

    getPublicEventAnalytics.mockResolvedValue({
      swimmer: {
        id: "swimmer-1",
        slug: "tester",
        displayName: "测试队员",
        teamId: "team-1",
        team: { id: "team-1", name: "海豚预备队", sortOrder: 1, isActive: true },
        strongestEventId: "event-1",
      },
      event: {
        id: "event-1",
        poolLengthM: 25,
        distanceM: 50,
        stroke: "freestyle",
        displayName: "50米 自由泳（短池）",
        sortOrder: 1,
        isActive: true,
      },
      series: {
        raw: [{ performedOn: "2026-04-06", timeMs: 32000, sourceType: "single" }],
        pb: [{ performedOn: "2026-04-06", timeMs: 32000, sourceType: "single" }],
        trend: [{ performedOn: "2026-04-06", timeMs: 32000, sourceType: "single" }],
        currentBestTimeMs: 32000,
      },
      goals: [
        {
          id: "goal-1",
          title: "50自游进30秒",
          horizon: "short_term",
          targetTimeMs: 30000,
          targetDate: "2026-06-01",
          baselineTimeMs: 32000,
          currentBestTimeMs: 32000,
          progress: 0.5,
          gapMs: 2000,
          isAchieved: false,
        },
      ],
      officialBenchmarks: [],
      officialGrade: null,
      nextOfficialGrade: null,
      officialGradeStatus: "unavailable_for_event",
      customStandards: [],
      nextCustomStandard: null,
      benchmarkLines: [],
    });
  });

  it("renders analytics content and no longer exposes the long-image download action", async () => {
    render(<SwimmerDetailPage />);

    expect(await screen.findByText("成长曲线模块")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "下载整页长图" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存分享海报" })).not.toBeInTheDocument();
  });
});
