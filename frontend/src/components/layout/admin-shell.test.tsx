import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AdminShell } from "@/components/layout/admin-shell";

const quickRecordModal = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();
const logoutAdmin = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/admin/quick-record-modal", () => ({
  QuickRecordModal: (props: { open: boolean }) => {
    quickRecordModal(props);
    return <div>quick-record-modal:{String(props.open)}</div>;
  },
}));

vi.mock("@/lib/api/admin", () => ({
  getAdminMe: vi.fn(),
  logoutAdmin: (...args: unknown[]) => logoutAdmin(...args),
}));

describe("AdminShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutAdmin.mockResolvedValue(undefined);
  });

  it("renders the page title and toggles mobile navigation", () => {
    render(
      <AdminShell description="后台说明" title="后台概览">
        <div>body</div>
      </AdminShell>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "后台概览" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "打开导航" }));

    expect(screen.getAllByText("孩子").length).toBeGreaterThan(0);
    expect(screen.getAllByText("队伍").length).toBeGreaterThan(0);
  });

  it("removes header shortcut hint and keeps public-page button plus keyboard quick record", () => {
    render(
      <AdminShell description="后台说明" title="后台概览">
        <div>body</div>
      </AdminShell>,
    );

    expect(screen.queryByText(/Ctrl \/ Cmd \+ K/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看公开页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "查看公开页" })).toHaveClass("rounded-full");
    expect(screen.getByRole("link", { name: "查看公开页" })).toHaveClass("h-10");
    expect(screen.getByRole("link", { name: "查看公开页" })).toHaveClass("font-semibold");
    expect(screen.getByRole("button", { name: "退出登录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出登录" })).toHaveClass("rounded-full");
    expect(screen.getByRole("button", { name: "退出登录" })).toHaveClass("h-10");
    expect(screen.getByRole("button", { name: "退出登录" })).toHaveClass("font-semibold");
    expect(screen.getByRole("button", { name: "退出登录" })).toHaveClass("bg-rose-50");
    expect(screen.getByRole("button", { name: "退出登录" })).toHaveClass("text-foreground");
    expect(screen.getByRole("link", { name: "概览" })).toHaveClass("text-white");

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(quickRecordModal).toHaveBeenCalled();
  });

  it("logs the administrator out from the header action button", async () => {
    render(
      <AdminShell description="后台说明" title="后台概览">
        <div>body</div>
      </AdminShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    await waitFor(() => {
      expect(logoutAdmin).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/admin/login");
    });
  });
});
