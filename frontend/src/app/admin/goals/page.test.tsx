import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import AdminGoalsPage from "@/app/admin/goals/page";

const listAdminSwimmers = vi.fn();
const listAdminEvents = vi.fn();
const listAdminGoals = vi.fn();
const createGoal = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/layout/admin-shell", () => ({
  AdminShell: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/components/shared/date-picker", () => ({
  DatePickerInput: ({
    ariaLabel,
    onChange,
    value,
  }: {
    ariaLabel?: string;
    onChange: (value: string) => void;
    value: string;
  }) => (
    <input
      aria-label={ariaLabel ?? "date-picker"}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}));

vi.mock("@/components/shared/time-input", () => ({
  TimeInput: ({
    onChange,
    value,
  }: {
    onChange: (value: number) => void;
    value: number;
  }) => (
    <input
      aria-label="time-input"
      onChange={(event) => onChange(Number(event.target.value))}
      value={String(value)}
    />
  ),
}));

vi.mock("@/lib/api/admin", () => ({
  listAdminSwimmers: (...args: unknown[]) => listAdminSwimmers(...args),
  listAdminEvents: (...args: unknown[]) => listAdminEvents(...args),
  listAdminGoals: (...args: unknown[]) => listAdminGoals(...args),
  createGoal: (...args: unknown[]) => createGoal(...args),
}));

describe("AdminGoalsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listAdminSwimmers.mockResolvedValue({
      swimmers: [
        {
          id: "swimmer-a",
          slug: "xiao-hai-tun",
          realName: "Alice Wang",
          nickname: "小海豚",
          publicNameMode: "nickname",
          isPublic: true,
          gender: "female",
          teamId: "team-a",
          team: {
            id: "team-a",
            name: "海豚预备队",
            sortOrder: 1,
            isActive: true,
          },
        },
      ],
    });
    listAdminEvents.mockResolvedValue({
      events: [
        {
          id: "event-a",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          displayName: "50米自由泳",
          sortOrder: 1,
          isActive: true,
        },
      ],
    });
    listAdminGoals.mockResolvedValue({
      goals: [
        {
          id: "goal-a",
          swimmerId: "swimmer-a",
          eventId: "event-a",
          title: "暑假前游进 35.50",
          baselineTimeMs: 38000,
          targetTimeMs: 35500,
          targetDate: "2026-08-01",
          horizon: "short",
          swimmer: {
            id: "swimmer-a",
            nickname: "小海豚",
            realName: "Alice Wang",
            teamId: "team-a",
            team: {
              id: "team-a",
              name: "海豚预备队",
              sortOrder: 1,
              isActive: true,
            },
          },
          event: {
            id: "event-a",
            poolLengthM: 25,
            distanceM: 50,
            stroke: "freestyle",
            displayName: "50米自由泳",
            sortOrder: 1,
            isActive: true,
          },
        },
      ],
    });
  });

  it("renders chinese goal labels in the created goals section", async () => {
    render(<AdminGoalsPage />);

    expect((await screen.findAllByText("短期")).length).toBeGreaterThan(0);
    expect(screen.getByText("基线成绩")).toBeInTheDocument();
    expect(screen.getByText("目标成绩")).toBeInTheDocument();
    expect(screen.queryByText(/short/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Baseline")).not.toBeInTheDocument();
    expect(screen.queryByText("Target")).not.toBeInTheDocument();
  });
});
