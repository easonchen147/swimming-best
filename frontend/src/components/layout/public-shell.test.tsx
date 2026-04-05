import { render, screen } from "@testing-library/react";

import { PublicShell } from "@/components/layout/public-shell";

describe("PublicShell", () => {
  it("renders the top navigation as button-style links", () => {
    render(
      <PublicShell>
        <div>body</div>
      </PublicShell>,
    );

    const homeLink = screen.getByRole("link", { name: "首页" });
    const compareLink = screen.getByRole("link", { name: "对比" });
    const adminLink = screen.getByRole("link", { name: "管理后台" });

    expect(homeLink).toHaveClass("rounded-full");
    expect(homeLink).toHaveClass("h-10");
    expect(compareLink).toHaveClass("rounded-full");
    expect(compareLink).toHaveClass("h-10");
    expect(adminLink).toHaveClass("rounded-full");
    expect(adminLink).toHaveClass("h-10");
  });
});
