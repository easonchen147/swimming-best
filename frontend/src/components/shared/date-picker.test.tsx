import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DatePickerInput, YearPickerInput } from "@/components/shared/date-picker";

describe("DatePickerInput", () => {
  it("shows the provided placeholder text", () => {
    render(
      <DatePickerInput
        ariaLabel="出生日期"
        onChange={vi.fn()}
        placeholder="请选择"
        value=""
      />,
    );

    expect(screen.getByRole("button", { name: "出生日期" })).toHaveTextContent("请选择");
  });

  it("uses the official shadcn trigger layout", () => {
    render(<DatePickerInput ariaLabel="发生日期" onChange={vi.fn()} value="" />);

    expect(screen.getByRole("button", { name: "发生日期" })).toHaveClass(
      "justify-start",
      "text-left",
      "font-normal",
    );
  });

  it("does not render quick action footer buttons in the popover", () => {
    render(<DatePickerInput ariaLabel="截止日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "截止日期" }));

    expect(screen.queryByRole("button", { name: "今天" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清空" })).not.toBeInTheDocument();
  });

  it("uses hidden overlay selects for month and year dropdown captions", () => {
    render(<DatePickerInput ariaLabel="发生日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));

    const dropdowns = screen.getAllByRole("combobox");

    expect(dropdowns).toHaveLength(2);
    dropdowns.forEach((dropdown) => {
      expect(dropdown).toHaveClass("absolute", "inset-0", "opacity-0");
    });
  });
});

describe("YearPickerInput", () => {
  it("uses the same shadcn trigger layout", () => {
    render(<YearPickerInput ariaLabel="出生年份" onChange={vi.fn()} value="" />);

    expect(screen.getByRole("button", { name: "出生年份" })).toHaveClass(
      "justify-start",
      "text-left",
      "font-normal",
    );
  });
});
