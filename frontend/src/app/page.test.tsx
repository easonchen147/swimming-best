import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import HomePage from "@/app/page";

const listPublicSwimmers = vi.fn();

vi.mock("@/components/layout/public-shell", () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/api/public", () => ({
  listPublicSwimmers: (...args: unknown[]) => listPublicSwimmers(...args),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicSwimmers.mockImplementation((input?: { teamId?: string; search?: string }) => {
      const swimmers = [
        {
          id: "swimmer-a",
          slug: "alice",
          displayName: "小海豚",
          strongestEventId: "event-1",
          teamId: "team-a",
          team: { id: "team-a", name: "海豚预备队", sortOrder: 1, isActive: true },
        },
        {
          id: "swimmer-b",
          slug: "bella",
          displayName: "小浪花",
          strongestEventId: "event-2",
          teamId: "team-b",
          team: { id: "team-b", name: "浪花竞速队", sortOrder: 2, isActive: true },
        },
      ];

      const filtered = swimmers.filter((item) => {
        const matchesTeam = !input?.teamId || item.teamId === input.teamId;
        const matchesSearch =
          !input?.search || item.displayName.includes(input.search);
        return matchesTeam && matchesSearch;
      });

      return Promise.resolve({ swimmers: filtered });
    });
  });

  it("passes team and search filters to the public swimmers api", async () => {
    render(<HomePage />);

    expect(await screen.findByText("小海豚")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("搜索姓名..."), {
      target: { value: "海豚" },
    });

    await waitFor(() => {
      expect(listPublicSwimmers).toHaveBeenLastCalledWith({ search: "海豚", teamId: undefined });
    });

    fireEvent.click(screen.getByRole("button", { name: "海豚预备队" }));

    await waitFor(() => {
      expect(listPublicSwimmers).toHaveBeenLastCalledWith({
        search: "海豚",
        teamId: "team-a",
      });
    });
  });
});
