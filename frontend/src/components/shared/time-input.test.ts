import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import {
  formatSwimTime,
  msToSeconds,
  parseShorthand,
  secondsToMs,
  TimeInput,
} from "@/components/shared/time-input";

describe("TimeInput conversion", () => {
  it("converts 35.11 seconds to 35110 milliseconds", () => {
    expect(secondsToMs(35.11)).toBe(35110);
  });

  it("converts 14.65 seconds to 14650 milliseconds", () => {
    expect(secondsToMs(14.65)).toBe(14650);
  });

  it("converts 35110 milliseconds to 35.11 seconds", () => {
    expect(msToSeconds(35110)).toBeCloseTo(35.11);
  });

  it("parses shorthand time correctly", () => {
    expect(parseShorthand("10523")).toBe(65230);
    expect(formatSwimTime(65230)).toBe("1:05.23");
  });

  it("shows validation feedback for invalid time input", () => {
    let currentValue = 15000;
    render(
      React.createElement(TimeInput, {
        onChange: (value: number) => {
          currentValue = value;
        },
        value: currentValue,
      }),
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "99:99" } });

    expect(
      screen.getByText("请输入合法时间，例如 32.15 或 1:05.23"),
    ).toBeInTheDocument();
  });

  it("uses chinese unit labels for seconds and milliseconds toggle", () => {
    let currentValue = 15000;
    render(
      React.createElement(TimeInput, {
        onChange: (value: number) => {
          currentValue = value;
        },
        value: currentValue,
      }),
    );

    const toggleButton = screen.getByRole("button", { name: "秒" });

    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByRole("button", { name: "毫秒" })).toBeInTheDocument();
  });
});
