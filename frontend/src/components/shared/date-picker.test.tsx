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

    const trigger = screen.getByRole("button", { name: "发生日期" });

    expect(trigger).toHaveClass(
      "justify-start",
      "text-left",
      "font-normal",
    );
    expect(trigger.querySelector("svg")).toBeNull();
  });

  it("does not render an extra clear button beside the trigger", () => {
    render(<DatePickerInput ariaLabel="截止日期" onChange={vi.fn()} value="2026-04-05" />);

    expect(screen.queryByRole("button", { name: "清空截止日期" })).not.toBeInTheDocument();
  });

  it("does not render quick action footer buttons in the popover", () => {
    render(<DatePickerInput ariaLabel="截止日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "截止日期" }));

    expect(screen.queryByRole("button", { name: "今天" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清空" })).not.toBeInTheDocument();
  });

  it("uses hidden overlay selects with a visible caption shell for month and year dropdowns", () => {
    render(<DatePickerInput ariaLabel="发生日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));

    const dropdowns = screen.getAllByRole("combobox");

    expect(dropdowns).toHaveLength(2);
    dropdowns.forEach((dropdown) => {
      expect(dropdown).toHaveClass("absolute", "inset-0", "opacity-0");
      expect(dropdown.parentElement).toHaveClass("relative", "inline-flex", "items-center");
      expect(dropdown.parentElement).not.toHaveClass("border", "border-input", "shadow-xs");
    });

    const visibleCaptionLabels = document.querySelectorAll(
      "span[aria-hidden='true']",
    );
    const visibleLabelTexts = Array.from(visibleCaptionLabels).map((node) =>
      node.textContent?.trim() ?? "",
    );

    expect(visibleCaptionLabels).toHaveLength(2);
    expect(visibleLabelTexts).toContain("2026");
    expect(visibleLabelTexts).toContain("4");
    expect(visibleLabelTexts).not.toContain("四月");

    const previousButton = document.querySelector(".rdp-button_previous");
    const nextButton = document.querySelector(".rdp-button_next");

    expect(previousButton).not.toBeNull();
    expect(nextButton).not.toBeNull();
    expect(previousButton).toHaveClass("absolute", "left-0", "z-10", "bg-transparent");
    expect(nextButton).toHaveClass("absolute", "right-0", "z-10", "bg-transparent");
  });

  it("changes the visible month when clicking the next navigation arrow", () => {
    render(<DatePickerInput ariaLabel="发生日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));

    const valuesBefore = screen
      .getAllByRole("combobox")
      .map((dropdown) => (dropdown as HTMLSelectElement).value);
    const nextButton = document.querySelector(".rdp-button_next");

    expect(nextButton).not.toBeNull();

    fireEvent.click(nextButton as Element);

    const valuesAfter = screen
      .getAllByRole("combobox")
      .map((dropdown) => (dropdown as HTMLSelectElement).value);

    expect(valuesAfter).not.toEqual(valuesBefore);
  });

  it("uses numeric month option labels instead of chinese month names", () => {
    render(<DatePickerInput ariaLabel="发生日期" onChange={vi.fn()} value="2026-04-05" />);

    fireEvent.click(screen.getByRole("button", { name: "发生日期" }));

    const dropdowns = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const monthDropdown = dropdowns.find((dropdown) =>
      Array.from(dropdown.options).some((option) => option.text === "4"),
    );

    expect(monthDropdown).toBeDefined();
    expect(
      Array.from((monthDropdown as HTMLSelectElement).options).some((option) =>
        option.text.includes("月"),
      ),
    ).toBe(false);
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
