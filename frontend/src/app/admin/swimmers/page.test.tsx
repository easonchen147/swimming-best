import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import AdminSwimmersPage from "@/app/admin/swimmers/page";

const listAdminSwimmers = vi.fn();
const listAdminTeams = vi.fn();
const createAdminSwimmer = vi.fn();
const updateAdminSwimmer = vi.fn();

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
  listAdminSwimmers: (...args: unknown[]) => listAdminSwimmers(...args),
  listAdminTeams: (...args: unknown[]) => listAdminTeams(...args),
  createAdminSwimmer: (...args: unknown[]) => createAdminSwimmer(...args),
  updateAdminSwimmer: (...args: unknown[]) => updateAdminSwimmer(...args),
}));

describe("AdminSwimmersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminTeams.mockResolvedValue({
      teams: [
        {
          id: "team-a",
          name: "海豚预备队",
          sortOrder: 1,
          isActive: true,
        },
      ],
    });
    listAdminSwimmers.mockResolvedValue({
      swimmers: [],
    });
    createAdminSwimmer.mockResolvedValue({
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
    });
  });

  it("submits swimmer gender to the admin api", async () => {
    render(<AdminSwimmersPage />);

    const inputs = await screen.findAllByRole("textbox");

    fireEvent.change(inputs[0], {
      target: { value: "Alice Wang" },
    });
    fireEvent.change(inputs[1], {
      target: { value: "小海豚" },
    });
    fireEvent.change(screen.getByLabelText("性别"), {
      target: { value: "female" },
    });
    fireEvent.click(screen.getByRole("button", { name: "创建档案" }));

    await waitFor(() => {
      expect(createAdminSwimmer).toHaveBeenCalledWith({
        realName: "Alice Wang",
        nickname: "小海豚",
        publicNameMode: "nickname",
        isPublic: true,
        gender: "female",
        teamId: "team-a",
        birthYear: undefined,
        notes: "",
      });
    });
  });
});
