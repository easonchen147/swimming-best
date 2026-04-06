import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import ComparePage from "@/app/compare/page";

const listPublicSwimmers = vi.fn();
const getPublicArena = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/layout/public-shell", () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/arena/arena-leaderboards", () => ({
  ArenaLeaderboards: ({
    groups,
    selectedGroupKey,
    onSelectGroup,
  }: {
    groups: Array<{ groupKey: string; event: { displayName: string } }>;
    selectedGroupKey: string;
    onSelectGroup: (groupKey: string) => void;
  }) => (
    <div>
      heatmap:{selectedGroupKey}
      {groups.map((group) => (
        <button key={group.groupKey} onClick={() => onSelectGroup(group.groupKey)} type="button">
          {group.event.displayName}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/lib/api/public", () => ({
  listPublicSwimmers: (...args: unknown[]) => listPublicSwimmers(...args),
  getPublicArena: (...args: unknown[]) => getPublicArena(...args),
}));

describe("ArenaPage through compare compatibility route", () => {
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
      ],
    });
    getPublicArena.mockResolvedValue({
      filters: { gender: "all", poolLengthM: undefined, teamId: "", ageBucket: "all" },
      summary: { groupCount: 2, competitorCount: 3 },
      groups: [
        {
          groupKey: "event-1:male:all",
          gender: "male",
          ageBucket: "all",
          event: {
            id: "event-1",
            poolLengthM: 25,
            distanceM: 50,
            stroke: "freestyle",
            effortType: "standard",
            displayName: "50米 自由泳（短池）",
            sortOrder: 10,
            isActive: true,
          },
          competitorCount: 2,
          heatScore: 78,
          heatLabel: "激烈",
          leaderGapMs: 500,
          leaderGapPercent: 0.015,
          leader: {
            swimmerId: "swimmer-a",
            displayName: "男A",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 32000,
          },
          rankings: [
            {
              rank: 1,
              swimmerId: "swimmer-a",
              displayName: "男A",
              teamId: "team-a",
              team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
              ageBucket: "all",
              bestTimeMs: 32000,
              gapFromLeaderMs: 0,
            },
            {
              rank: 2,
              swimmerId: "swimmer-b",
              displayName: "男B",
              teamId: "team-a",
              team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
              ageBucket: "all",
              bestTimeMs: 32500,
              gapFromLeaderMs: 500,
            },
          ],
        },
        {
          groupKey: "event-2:female:u12",
          gender: "female",
          ageBucket: "u12",
          event: {
            id: "event-2",
            poolLengthM: 50,
            distanceM: 100,
            stroke: "backstroke",
            effortType: "standard",
            displayName: "100米 仰泳（长池）",
            sortOrder: 20,
            isActive: true,
          },
          competitorCount: 1,
          heatScore: 28,
          heatLabel: "观察",
          leaderGapMs: 0,
          leaderGapPercent: 0,
          leader: {
            swimmerId: "swimmer-c",
            displayName: "女A",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 71500,
          },
          rankings: [
            {
              rank: 1,
              swimmerId: "swimmer-c",
              displayName: "女A",
              teamId: "team-a",
              team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
              ageBucket: "u12",
              bestTimeMs: 71500,
              gapFromLeaderMs: 0,
            },
          ],
        },
      ],
    });
  });

  it("renders arena market data and switches selected race group", async () => {
    render(<ComparePage />);

    expect(await screen.findByText("竞技场")).toBeInTheDocument();
    expect(screen.getByText("赛道排行榜")).toBeInTheDocument();
    expect(screen.getAllByText("50米 自由泳（短池）").length).toBeGreaterThan(0);
    expect(screen.getByText("男A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "100米 仰泳（长池）" }));

    await waitFor(() => {
      expect(screen.getByText("女A")).toBeInTheDocument();
    });
    expect(screen.getAllByText("100米 仰泳（长池）").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "女子" }));

    await waitFor(() => {
      expect(getPublicArena).toHaveBeenCalledWith({
        gender: "female",
        poolLengthM: undefined,
        teamId: undefined,
        ageBucket: undefined,
      });
    });
  });
});
