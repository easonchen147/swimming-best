import { render, screen } from "@testing-library/react";

import { StandardProgress } from "@/components/shared/standard-progress";

describe("StandardProgress", () => {
  it("renders the next benchmark gap", () => {
    render(
      <StandardProgress
        nextStandard={{
          id: "entry-1",
          standardId: "standard-1",
          eventId: "event-1",
          gender: "male",
          qualifyingTimeMs: 25000,
          tierGroup: "暑期集训",
          name: "A 组达标",
          tierOrder: 2,
          colorHex: "#3b82f6",
          eventDisplayName: "50m 自由泳短池",
          gapMs: 900,
        }}
      />,
    );

    expect(screen.getByText(/A 组达标/)).toBeInTheDocument();
    expect(screen.getByText(/0.90s/)).toBeInTheDocument();
  });
});
