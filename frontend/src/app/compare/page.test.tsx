import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import ComparePage from "@/app/compare/page";

const listPublicSwimmers = vi.fn();
const listPublicSwimmerEvents = vi.fn();
const comparePublicEvent = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/layout/public-shell", () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/charts/compare-chart", () => ({
  CompareChart: ({ swimmers }: { swimmers: Array<{ displayName: string }> }) => (
    <div>compare-chart:{swimmers.map((item) => item.displayName).join(",")}</div>
  ),
}));

vi.mock("@/lib/api/public", () => ({
  listPublicSwimmers: (...args: unknown[]) => listPublicSwimmers(...args),
  listPublicSwimmerEvents: (...args: unknown[]) => listPublicSwimmerEvents(...args),
  comparePublicEvent: (...args: unknown[]) => comparePublicEvent(...args),
}));

describe("ComparePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicSwimmers.mockResolvedValue({
      swimmers: [
        {
          id: "swimmer-a",
          slug: "alice",
          displayName: "Alice",
          strongestEventId: "event-1",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
        },
        {
          id: "swimmer-b",
          slug: "bella",
          displayName: "Bella",
          strongestEventId: "event-1",
          teamId: "team-b",
          team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
        },
      ],
    });
    listPublicSwimmerEvents.mockResolvedValue({
      events: [
        {
          event: {
            id: "event-1",
            poolLengthM: 25,
            distanceM: 50,
            stroke: "freestyle",
            effortType: "sprint",
            displayName: "50m freestyle sprint",
            sortOrder: 1,
            isActive: true,
          },
          currentBestTimeMs: 32000,
        },
      ],
    });
    comparePublicEvent.mockResolvedValue({
      event: {
        id: "event-1",
        poolLengthM: 25,
        distanceM: 50,
        stroke: "freestyle",
        effortType: "sprint",
        displayName: "50m freestyle sprint",
        sortOrder: 1,
        isActive: true,
      },
      swimmers: [
        {
          swimmerId: "swimmer-a",
          displayName: "Alice",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
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
          team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
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
      ],
    });
  });

  it("loads compare selections and renders compare results", async () => {
    render(<ComparePage />);

    expect(await screen.findByText("同项目进步对比")).toBeInTheDocument();

    await waitFor(() => {
      expect(comparePublicEvent).toHaveBeenCalledWith("event-1", [
        "swimmer-a",
        "swimmer-b",
      ]);
    });

    expect(screen.getByText("对比摘要")).toBeInTheDocument();
    expect(screen.getByText("最佳 32.00s")).toBeInTheDocument();
    expect(screen.getByText("最佳 31.50s")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Alice" }));
    fireEvent.click(screen.getByRole("button", { name: "Alice" }));

    await waitFor(() => {
      expect(comparePublicEvent).toHaveBeenLastCalledWith("event-1", [
        "swimmer-a",
        "swimmer-b",
      ]);
    });
  });
});
