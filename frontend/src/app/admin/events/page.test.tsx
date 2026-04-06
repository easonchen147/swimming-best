import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import AdminEventsPage from "@/app/admin/events/page";

const listAdminEvents = vi.fn();
const createAdminEvent = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: (...args: unknown[]) => toastError(...args),
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
  listAdminEvents: (...args: unknown[]) => listAdminEvents(...args),
  createAdminEvent: (...args: unknown[]) => createAdminEvent(...args),
}));

describe("AdminEventsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminEvents.mockResolvedValue({
      events: [
        {
          id: "builtin-25-50-freestyle",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          displayName: "50米 自由泳（短池）",
          sortOrder: 10,
          isActive: true,
        },
        {
          id: "duplicate-row",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          displayName: "50米 自由泳（短池）",
          sortOrder: 11,
          isActive: true,
        },
      ],
    });
  });

  it("dedupes fetched events and warns when creating an existing event", async () => {
    render(<AdminEventsPage />);

    expect(await screen.findByText("50米 自由泳（短池）")).toBeInTheDocument();
    expect(screen.getAllByText("50米 自由泳（短池）")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "保存项目" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("该项目已经存在");
    });
    expect(createAdminEvent).not.toHaveBeenCalled();
  });

  it("passes search input to the events api", async () => {
    render(<AdminEventsPage />);

    expect(await screen.findByText("50米 自由泳（短池）")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("搜索项目名称..."), {
      target: { value: "自由泳" },
    });

    await waitFor(() => {
      expect(listAdminEvents).toHaveBeenLastCalledWith("自由泳");
    });
  });
});
