## 1. Shared Primitive Fixes

- [x] 1.1 Fix the shared `Button` `asChild` implementation so link buttons apply styling to the actual `Link` root element.
- [x] 1.2 Replace the shared `Select` implementation with the shadcn/Radix Select primitive set and update `SelectField` to use the new API.

## 2. Page Integration

- [x] 2.1 Align the admin header “查看公开页” button with the “退出登录” button style and ensure the admin dashboard quick-action buttons all share one consistent pattern.
- [x] 2.2 Align the public header home / compare / admin navigation to true button-style links that match the admin button family with color-only differentiation.
- [x] 2.3 Migrate affected admin and public pages that still rely on the old native select wrapper to the new shared Radix Select usage.

## 3. Verification And Archive

- [x] 3.1 Update unit tests and browser tests for the new button-link semantics and Radix Select interactions.
- [x] 3.2 Run frontend lint, unit tests, build, and Playwright verification for the affected pages.
- [x] 3.3 Sync the finalized behavior back into the main OpenSpec specs and archive the change.
