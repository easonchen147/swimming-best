import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { ImportWizard } from "@/components/shared/import-wizard";

const previewImportCsv = vi.fn();
const confirmImportCsv = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api/admin", () => ({
  previewImportCsv: (...args: unknown[]) => previewImportCsv(...args),
  confirmImportCsv: (...args: unknown[]) => confirmImportCsv(...args),
  getImportTemplateUrl: () => "/api/admin/import/template",
}));

describe("ImportWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    previewImportCsv.mockResolvedValue({
      validRows: [
        {
          line: 1,
          swimmerId: "swimmer-1",
          swimmerSlug: "alice",
          eventId: "event-1",
          eventDisplay: "50m 自由泳 短池",
          performedOn: "2026-04-01",
          timeSeconds: 25.9,
          timeMs: 25900,
          sourceType: "competition",
          tags: ["达标赛"],
        },
      ],
      errorRows: [],
      summary: {
        total: 1,
        valid: 1,
        errors: 0,
      },
    });
    confirmImportCsv.mockResolvedValue({
      imported: 1,
      contextsCreated: 1,
      performancesCreated: 1,
      tagsCreated: 1,
    });
  });

  it("flows from upload to preview to confirm", async () => {
    render(<ImportWizard />);

    const fileInput = screen.getByLabelText("导入文件");
    const file = new File(["csv"], "performances.csv", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: "解析预览" }));

    expect(await screen.findByText(/总计 1 行/)).toBeInTheDocument();
    expect(screen.getByText(/alice · 50m 自由泳 短池/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "确认导入" }));

    await waitFor(() => {
      expect(confirmImportCsv).toHaveBeenCalledWith([
        expect.objectContaining({ swimmerSlug: "alice" }),
      ]);
    });
    expect(await screen.findByText(/导入 1 条成绩/)).toBeInTheDocument();
  });
});
