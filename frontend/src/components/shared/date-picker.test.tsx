import { fireEvent, render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { vi } from "vitest";

import { DatePickerInput, YearPickerInput } from "@/components/shared/date-picker";

describe("DatePickerInput", () => {
  it("renders and updates a date value", () => {
    const onChange = vi.fn();
    render(<DatePickerInput ariaLabel="发生日期" onChange={onChange} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));
    fireEvent.click(screen.getByRole("button", { name: "今天" }));

    expect(onChange).toHaveBeenCalledWith(format(new Date(), "yyyy-MM-dd"));
  });

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

  it("clears the selected value", () => {
    const onChange = vi.fn();
    render(<DatePickerInput ariaLabel="截止日期" onChange={onChange} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "截止日期" }));
    fireEvent.click(screen.getByRole("button", { name: "清空" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("YearPickerInput", () => {
  it("renders and updates a year value", () => {
    const onChange = vi.fn();
    render(<YearPickerInput ariaLabel="出生年份" onChange={onChange} value="" />);

    fireEvent.click(screen.getByRole("button", { name: "出生年份" }));
    const yearSelect = screen.getByRole("combobox", { name: /year/i });
    fireEvent.change(yearSelect, { target: { value: "2016" } });

    expect(onChange).toHaveBeenCalledWith("2016");
  });
});
