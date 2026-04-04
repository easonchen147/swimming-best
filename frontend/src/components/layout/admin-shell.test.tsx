import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminShell } from "@/components/layout/admin-shell";

const quickRecordModal = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/admin/quick-record-modal", () => ({
  QuickRecordModal: (props: { open: boolean }) => {
    quickRecordModal(props);
    return <div>quick-record-modal:{String(props.open)}</div>;
  },
}));

describe("AdminShell", () => {
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

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(quickRecordModal).toHaveBeenCalled();
  });
});
