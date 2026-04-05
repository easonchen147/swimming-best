import { render, screen } from "@testing-library/react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

describe("shared ui primitives", () => {
  it("renders Label with the provided htmlFor relationship", () => {
    render(
      <div>
        <Label htmlFor="field-id">字段标签</Label>
        <input id="field-id" />
      </div>,
    );

    expect(screen.getByText("字段标签").tagName).toBe("LABEL");
    expect(screen.getByText("字段标签")).toHaveAttribute("for", "field-id");
  });

  it("renders Badge as child when requested", () => {
    render(
      <Badge asChild variant="outline">
        <a href="/demo">状态标签</a>
      </Badge>,
    );

    const link = screen.getByRole("link", { name: "状态标签" });
    expect(link).toHaveAttribute("href", "/demo");
    expect(link).toHaveClass("rounded-full");
    expect(link).toHaveClass("border");
  });
});
