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

  it("requires explicit swimmer and event selection before rendering compare results", async () => {
    render(<ComparePage />);

    expect(await screen.findByText("进步对比分析")).toBeInTheDocument();
    expect(screen.getByText("待选对比成员")).toBeInTheDocument();
    expect(comparePublicEvent).not.toHaveBeenCalled();

    const eventSelect = screen.getByRole("combobox", { name: "对比项目" });
    expect(eventSelect).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Alice" }));

    await waitFor(() => {
      expect(listPublicSwimmerEvents).toHaveBeenCalledWith("alice");
    });

    expect(screen.getByText("待选对比成员")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bella" }));
    expect(await screen.findByText("待选对比项目")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox", { name: "对比项目" }));
    fireEvent.click(await screen.findByRole("option", { name: "50m freestyle sprint" }));

    await waitFor(() => {
      expect(comparePublicEvent).toHaveBeenCalledWith("event-1", [
        "swimmer-a",
        "swimmer-b",
      ]);
    });

    expect(screen.getByText("趋势走势对比")).toBeInTheDocument();
    expect(screen.getAllByText("32.00s").length).toBeGreaterThan(0);
    expect(screen.getAllByText("31.50s").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Alice" }));

    await waitFor(() => {
      expect(screen.getByText("待选对比成员")).toBeInTheDocument();
    });
  });
});
