import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import AdminTeamsPage from "@/app/admin/teams/page";

const listAdminTeams = vi.fn();
const createAdminTeam = vi.fn();
const updateAdminTeam = vi.fn();

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

vi.mock("@/lib/api/admin", () => ({
  listAdminTeams: (...args: unknown[]) => listAdminTeams(...args),
  createAdminTeam: (...args: unknown[]) => createAdminTeam(...args),
  updateAdminTeam: (...args: unknown[]) => updateAdminTeam(...args),
}));

describe("AdminTeamsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminTeams.mockResolvedValue({
      teams: [
        {
          id: "team-a",
          name: "海豚预备队",
          sortOrder: 1,
          isActive: true,
          swimmerCount: 1,
        },
      ],
    });
    createAdminTeam.mockResolvedValue({
      id: "team-b",
      name: "浪花竞速队",
      sortOrder: 2,
      isActive: true,
      swimmerCount: 0,
    });
    updateAdminTeam.mockResolvedValue({
      id: "team-a",
      name: "海豚预备一队",
      sortOrder: 1,
      isActive: true,
      swimmerCount: 1,
    });
  });

  it("loads managed teams and creates a new team", async () => {
    listAdminTeams
      .mockResolvedValueOnce({
        teams: [
          {
            id: "team-a",
            name: "海豚预备队",
            sortOrder: 1,
            isActive: true,
            swimmerCount: 1,
          },
        ],
      })
      .mockResolvedValueOnce({
        teams: [
          {
            id: "team-a",
            name: "海豚预备队",
            sortOrder: 1,
            isActive: true,
            swimmerCount: 1,
          },
          {
            id: "team-b",
            name: "浪花竞速队",
            sortOrder: 2,
            isActive: true,
            swimmerCount: 0,
          },
        ],
      });

    render(<AdminTeamsPage />);

    expect(await screen.findByText("海豚预备队")).toBeInTheDocument();
    expect(screen.getByText("队员数 1")).toBeInTheDocument();
    expect(screen.getByText("有效")).toBeInTheDocument();
    expect(screen.queryByText(/order:/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("队伍名称"), {
      target: { value: "浪花竞速队" },
    });
    fireEvent.change(screen.getByLabelText("显示权重 (排序)"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建队伍" }));

    await waitFor(() => {
      expect(createAdminTeam).toHaveBeenCalledWith({
        name: "浪花竞速队",
        sortOrder: 2,
        isActive: true,
      });
    });
    expect(await screen.findByText("浪花竞速队")).toBeInTheDocument();
  });

  it("passes search input to the teams api", async () => {
    render(<AdminTeamsPage />);

    expect(await screen.findByText("海豚预备队")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("搜索队伍名称..."), {
      target: { value: "海豚" },
    });

    await waitFor(() => {
      expect(listAdminTeams).toHaveBeenLastCalledWith("海豚");
    });
  });
});
