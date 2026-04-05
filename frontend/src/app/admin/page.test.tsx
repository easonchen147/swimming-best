import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import AdminDashboardPage from "@/app/admin/page";

const getAdminMe = vi.fn();
const listAdminSwimmers = vi.fn();
const listAdminEvents = vi.fn();
const listAdminTeams = vi.fn();
const triggerQuickRecord = vi.fn();

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
  triggerQuickRecord: () => triggerQuickRecord(),
}));

vi.mock("@/lib/api/admin", () => ({
  getAdminMe: (...args: unknown[]) => getAdminMe(...args),
  listAdminSwimmers: (...args: unknown[]) => listAdminSwimmers(...args),
  listAdminEvents: (...args: unknown[]) => listAdminEvents(...args),
  listAdminTeams: (...args: unknown[]) => listAdminTeams(...args),
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminMe.mockResolvedValue({ username: "admin" });
    listAdminSwimmers.mockResolvedValue({ swimmers: [] });
    listAdminEvents.mockResolvedValue({ events: [] });
    listAdminTeams.mockResolvedValue({ teams: [] });
  });

  it("renders flowchart guidance and quick actions", async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByRole("button", { name: /快速录入成绩/i })).toBeInTheDocument();
    expect(screen.getByText(/Ctrl \/ Cmd \+ K/i)).toBeInTheDocument();
    expect(screen.getByText("推进管理流程")).toBeInTheDocument();
    expect(screen.getAllByText("Next Step").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /添加目标成绩/i })).toHaveAttribute(
      "href",
      "/admin/goals",
    );
    expect(screen.getByRole("link", { name: /查看项目目录/i })).toHaveAttribute(
      "href",
      "/admin/events",
    );
    expect(screen.getByRole("button", { name: /快速录入成绩/i })).toHaveClass("text-left");
    expect(screen.getByRole("link", { name: /添加目标成绩/i })).toHaveClass("text-left");
    expect(screen.getByRole("link", { name: /查看项目目录/i })).toHaveClass("text-left");

    fireEvent.click(screen.getByRole("button", { name: /快速录入成绩/i }));
    expect(triggerQuickRecord).toHaveBeenCalled();
  });
});
