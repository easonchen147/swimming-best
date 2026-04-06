import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import ComparePage from "@/app/compare/page";

const getPublicArena = vi.fn();

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

vi.mock("@/components/shared/form-field", () => ({
  SelectField: ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: Array<{ label: string; value: string }>;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      <span>{label}</span>
      <select aria-label={label} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

vi.mock("@/lib/api/public", () => ({
  getPublicArena: (...args: unknown[]) => getPublicArena(...args),
}));

describe("ArenaPage through compare compatibility route", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
      configurable: true,
      value: () => false,
    });
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      configurable: true,
      value: () => {},
    });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
      configurable: true,
      value: () => {},
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getPublicArena.mockResolvedValue({
      filters: { gender: "all", poolLengthM: undefined, teamId: "", ageBucket: "all" },
      summary: { groupCount: 3, competitorCount: 4 },
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
            displayName: "男甲",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 32000,
          },
          rankings: [
            {
              rank: 1,
              swimmerId: "swimmer-a",
              displayName: "男甲",
              teamId: "team-a",
              team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
              ageBucket: "all",
              bestTimeMs: 32000,
              gapFromLeaderMs: 0,
            },
            {
              rank: 2,
              swimmerId: "swimmer-b",
              displayName: "男乙",
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
            displayName: "女乙",
            teamId: "team-a",
            team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
            bestTimeMs: 71500,
          },
          rankings: [
            {
              rank: 1,
              swimmerId: "swimmer-c",
              displayName: "女乙",
              teamId: "team-a",
              team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
              ageBucket: "u12",
              bestTimeMs: 71500,
              gapFromLeaderMs: 0,
            },
          ],
        },
        {
          groupKey: "event-3:male:u11",
          gender: "male",
          ageBucket: "u11",
          event: {
            id: "event-3",
            poolLengthM: 50,
            distanceM: 100,
            stroke: "backstroke",
            effortType: "standard",
            displayName: "100米 仰泳（长池）",
            sortOrder: 21,
            isActive: true,
          },
          competitorCount: 1,
          heatScore: 26,
          heatLabel: "观察",
          leaderGapMs: 0,
          leaderGapPercent: 0,
          leader: {
            swimmerId: "swimmer-d",
            displayName: "男丙",
            teamId: "team-b",
            team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
            bestTimeMs: 70500,
          },
          rankings: [
            {
              rank: 1,
              swimmerId: "swimmer-d",
              displayName: "男丙",
              teamId: "team-b",
              team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
              ageBucket: "u11",
              bestTimeMs: 70500,
              gapFromLeaderMs: 0,
            },
          ],
        },
      ],
    });
  });

  async function selectOption(label: string, option: string) {
    const select = screen.getByRole("combobox", { name: label }) as HTMLSelectElement;
    const targetOption = Array.from(select.options).find((item) => item.text === option);

    if (!targetOption) {
      throw new Error(`option not found: ${label} -> ${option}`);
    }

    fireEvent.change(select, {
      target: { value: targetOption.value },
    });
  }

  it("renders three dropdown filters under the arena header", async () => {
    render(<ComparePage />);

    expect(await screen.findByRole("heading", { name: "竞技场" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "赛道切换" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "赛道详情" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "性别筛选" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "池长筛选" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "项目筛选" })).toBeInTheDocument();
    expect(screen.getByText("当前赛道热度")).toBeInTheDocument();

    await waitFor(() => {
      expect(getPublicArena).toHaveBeenCalledWith({
        gender: undefined,
        poolLengthM: undefined,
      });
    });
  });

  it("uses gender and pool filters to refresh arena data from the API", async () => {
    render(<ComparePage />);

    expect(await screen.findByText(/当前头名 男甲/)).toBeInTheDocument();

    await selectOption("性别筛选", "女子");

    await waitFor(() => {
      expect(getPublicArena).toHaveBeenLastCalledWith({
        gender: "female",
        poolLengthM: undefined,
      });
    });
  });

  it("uses the project dropdown to filter leaderboard cards and detail panel client-side", async () => {
    render(<ComparePage />);

    expect(await screen.findByText(/当前头名 男甲/)).toBeInTheDocument();
    expect(getPublicArena).toHaveBeenCalledTimes(1);

    await selectOption("项目筛选", "100米 仰泳");

    await waitFor(() => {
      expect(screen.getByText(/当前头名 女乙/)).toBeInTheDocument();
    });

    expect(screen.queryByText(/当前头名 男甲/)).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "项目筛选" })).toHaveTextContent("100米 仰泳");
    expect(screen.queryByText("50米 自由泳（短池）")).not.toBeInTheDocument();
    expect(screen.getByText("观察 · 28分")).toBeInTheDocument();
    expect(getPublicArena).toHaveBeenCalledTimes(1);
  });
});
