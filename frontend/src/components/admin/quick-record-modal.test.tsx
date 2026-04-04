import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { QuickRecordModal } from "@/components/admin/quick-record-modal";

const listAdminSwimmers = vi.fn();
const listAdminEvents = vi.fn();
const quickRecordPerformance = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@/lib/api/admin", () => ({
  listAdminSwimmers: (...args: unknown[]) => listAdminSwimmers(...args),
  listAdminEvents: (...args: unknown[]) => listAdminEvents(...args),
  quickRecordPerformance: (...args: unknown[]) => quickRecordPerformance(...args),
}));

vi.mock("@/lib/swimmer-label", () => ({
  describeSwimmer: (swimmer: { nickname: string }) => swimmer.nickname,
}));

describe("QuickRecordModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminSwimmers.mockResolvedValue({
      swimmers: [
        {
          id: "swimmer-1",
          nickname: "小海豚",
          realName: "Alice",
          teamId: "team-1",
          team: { id: "team-1", name: "海豚队", sortOrder: 1, isActive: true },
        },
      ],
    });
    listAdminEvents.mockResolvedValue({
      events: [
        {
          id: "event-1",
          displayName: "50m 自由泳",
          poolLengthM: 25,
          distanceM: 50,
          stroke: "freestyle",
          effortType: "sprint",
          sortOrder: 1,
          isActive: true,
        },
      ],
    });
    quickRecordPerformance.mockResolvedValue({});
  });

  it("loads selectors and submits a quick record", async () => {
    render(
      <QuickRecordModal onOpenChange={vi.fn()} open />,
    );

    expect(await screen.findByText("快速成绩录入")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("标签（分号或逗号分隔）"), {
      target: { value: "月测;主项" },
    });

    fireEvent.click(screen.getByRole("button", { name: /立即保存/i }));

    await waitFor(() => {
      expect(quickRecordPerformance).toHaveBeenCalledWith(
        expect.objectContaining({
          swimmerId: "swimmer-1",
          eventId: "event-1",
          tags: ["月测", "主项"],
        }),
      );
    });
  });
});
