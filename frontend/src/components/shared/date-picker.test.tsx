import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DatePickerInput, YearPickerInput } from "@/components/shared/date-picker";

describe("DatePickerInput", () => {
  it("renders and updates a date value", () => {
    const onChange = vi.fn();
    render(<DatePickerInput ariaLabel="发生日期" onChange={onChange} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));
    fireEvent.change(screen.getByDisplayValue("2026-04-05"), {
      target: { value: "2026-04-06" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-04-06");
  });
});

describe("YearPickerInput", () => {
  it("renders and updates a year value", () => {
    const onChange = vi.fn();
    render(<YearPickerInput ariaLabel="出生年份" onChange={onChange} value="" />);

    fireEvent.click(screen.getByRole("button", { name: "出生年份" }));
    fireEvent.click(screen.getByRole("button", { name: "2016" }));

    expect(onChange).toHaveBeenCalledWith("2016");
  });
});
