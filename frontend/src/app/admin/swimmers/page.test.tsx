import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
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
      birthDate: "2016-05-12",
      teamId: "team-a",
      team: {
        id: "team-a",
        name: "海豚预备队",
        sortOrder: 1,
        isActive: true,
      },
    });
  });

  it("submits swimmer gender and selected birth date to the admin api", async () => {
    render(<AdminSwimmersPage />);
    const today = format(new Date(), "yyyy-MM-dd");

    const inputs = await screen.findAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "Alice Wang" } });
    fireEvent.change(inputs[1], { target: { value: "小海豚" } });

    fireEvent.click(screen.getByRole("combobox", { name: "所属队伍" }));
    fireEvent.click(await screen.findByRole("option", { name: "海豚预备队" }));

    fireEvent.click(screen.getByRole("combobox", { name: "性别" }));
    fireEvent.click(await screen.findByRole("option", { name: "女" }));

    fireEvent.click(screen.getByRole("button", { name: "出生日期" }));
    fireEvent.click(screen.getByRole("button", { name: "今天" }));

    fireEvent.click(screen.getByRole("button", { name: "创建档案" }));

    await waitFor(() => {
      expect(createAdminSwimmer).toHaveBeenCalledWith({
        realName: "Alice Wang",
        nickname: "小海豚",
        publicNameMode: "nickname",
        isPublic: true,
        gender: "female",
        teamId: "team-a",
        birthDate: today,
        notes: "",
      });
    });
  });

  it("passes roster search input to the swimmers api", async () => {
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
          birthDate: "2016-05-12",
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

    render(<AdminSwimmersPage />);

    expect(await screen.findByText("真实姓名：Alice Wang")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("搜索姓名或昵称..."), {
      target: { value: "海豚" },
    });

    await waitFor(() => {
      expect(listAdminSwimmers).toHaveBeenLastCalledWith(undefined, "海豚");
    });
  });

  it("restores public visibility when switching a hidden swimmer back to a visible mode", async () => {
    listAdminSwimmers.mockResolvedValue({
      swimmers: [
        {
          id: "swimmer-hidden",
          slug: "mi-mi-xuan-shou",
          realName: "Cara Li",
          nickname: "秘密选手",
          publicNameMode: "hidden",
          isPublic: false,
          gender: "female",
          birthDate: "",
          birthYear: 2015,
          teamId: "team-a",
          team: {
            id: "team-a",
            name: "海豚预备队",
            sortOrder: 1,
            isActive: true,
          },
          notes: "",
        },
      ],
    });
    updateAdminSwimmer.mockResolvedValue({
      id: "swimmer-hidden",
      slug: "mi-mi-xuan-shou",
      realName: "Cara Li",
      nickname: "秘密选手",
      publicNameMode: "nickname",
      isPublic: true,
      gender: "female",
      birthDate: "",
      birthYear: 2015,
      teamId: "team-a",
      team: {
        id: "team-a",
        name: "海豚预备队",
        sortOrder: 1,
        isActive: true,
      },
      notes: "",
    });

    render(<AdminSwimmersPage />);

    fireEvent.click(await screen.findByRole("button", { name: "编辑队员" }));
    fireEvent.click(screen.getByRole("combobox", { name: "展示姓名模式" }));
    fireEvent.click(await screen.findByRole("option", { name: "展示昵称" }));
    fireEvent.click(screen.getByRole("button", { name: "更新档案" }));

    await waitFor(() => {
      expect(updateAdminSwimmer).toHaveBeenCalledWith("swimmer-hidden", {
        realName: "Cara Li",
        nickname: "秘密选手",
        publicNameMode: "nickname",
        isPublic: true,
        gender: "female",
        teamId: "team-a",
        birthDate: "",
        notes: "",
      });
    });
  });
});
