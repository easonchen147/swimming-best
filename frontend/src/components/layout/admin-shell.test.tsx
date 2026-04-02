import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AdminShell } from "@/components/layout/admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("AdminShell", () => {
  it("renders the page title and toggles mobile navigation", () => {
    render(
      <AdminShell description="后台说明" title="后台概览">
        <div>body</div>
      </AdminShell>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "后台概览" }),
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "打开导航" });
    fireEvent.click(button);

    expect(screen.getAllByText("孩子").length).toBeGreaterThan(0);
    expect(screen.getAllByText("队伍").length).toBeGreaterThan(0);
  });
});
