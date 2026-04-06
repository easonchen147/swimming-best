import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import SwimmerDetailPage from "@/app/swimmers/[slug]/page";

const toPng = vi.fn();
const getPublicSwimmer = vi.fn();
const listPublicSwimmerEvents = vi.fn();
const getPublicEventAnalytics = vi.fn();

vi.mock("html-to-image", () => ({
  toPng: (...args: unknown[]) => toPng(...args),
}));

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
  beforeAll(() => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

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

    toPng.mockResolvedValue("data:image/png;base64,aaa");
  });

  it("exports a full growth poster instead of only the hero card", async () => {
    render(<SwimmerDetailPage />);

    expect(await screen.findByText("成长曲线模块")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存分享海报" }));

    await waitFor(() => {
      expect(toPng).toHaveBeenCalledTimes(1);
    });

    const [target, options] = toPng.mock.calls[0] as [
      HTMLDivElement,
      {
        backgroundColor: string;
        canvasHeight: number;
        canvasWidth: number;
        filter: (node: HTMLElement | SVGElement) => boolean;
        height: number;
        skipAutoScale: boolean;
        width: number;
      },
    ];

    expect(target.dataset.testid).toBe("swimmer-detail-export");
    expect(target.textContent).toContain("测试队员");
    expect(target.textContent).toContain("PB");
    expect(target.textContent).toContain("成长曲线模块");
    expect(options.backgroundColor).toBe("#f8fafc");
    expect(typeof options.width).toBe("number");
    expect(typeof options.height).toBe("number");
    expect(options.canvasWidth).toBe(options.width * 2);
    expect(options.canvasHeight).toBe(options.height * 2);
    expect(options.skipAutoScale).toBe(true);

    const ignored = document.createElement("button");
    ignored.dataset.exportIgnore = "true";
    const kept = document.createElement("div");

    expect(options.filter(ignored)).toBe(false);
    expect(options.filter(kept)).toBe(true);
  });
});
