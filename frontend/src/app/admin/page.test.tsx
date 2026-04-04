import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import AdminDashboardPage from "@/app/admin/page";

const getAdminMe = vi.fn();
const listAdminSwimmers = vi.fn();
const listAdminEvents = vi.fn();
const listAdminTeams = vi.fn();

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

  it("renders quick actions as working links", async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByRole("link", { name: /录入新成绩/i })).toHaveAttribute(
      "href",
      "/admin/records",
    );
    expect(screen.getByRole("link", { name: /批量导入表格/i })).toHaveAttribute(
      "href",
      "/admin/import",
    );
    expect(screen.getByRole("link", { name: /管理学员档案/i })).toHaveAttribute(
      "href",
      "/admin/swimmers",
    );
  });
});
