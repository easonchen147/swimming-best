import { secondsToMs, msToSeconds } from "@/components/shared/time-input";

describe("TimeInput conversion", () => {
  it("converts 35.11 seconds to 35110 milliseconds", () => {
    expect(secondsToMs(35.11)).toBe(35110);
  });

  it("converts 14.65 seconds to 14650 milliseconds", () => {
    expect(secondsToMs(14.65)).toBe(14650);
  });

  it("converts 0 seconds to 0 milliseconds", () => {
    expect(secondsToMs(0)).toBe(0);
  });

  it("converts 35110 milliseconds to 35.11 seconds", () => {
    expect(msToSeconds(35110)).toBeCloseTo(35.11);
  });

  it("rounds fractional milliseconds", () => {
    expect(secondsToMs(1.2345)).toBe(1235);
  });
});
