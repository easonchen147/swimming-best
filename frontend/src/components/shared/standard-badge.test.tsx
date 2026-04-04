import { render, screen } from "@testing-library/react";

import { StandardBadge } from "@/components/shared/standard-badge";

describe("StandardBadge", () => {
  it("renders label text", () => {
    render(<StandardBadge colorHex="#3b82f6" label="A组达标" />);
    expect(screen.getByText("A组达标")).toBeInTheDocument();
  });
});
