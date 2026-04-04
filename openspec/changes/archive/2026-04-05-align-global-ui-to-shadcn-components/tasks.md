## 1. Primitive Refresh

- [x] 1.1 Refactor the shared `ui` primitives to align with a shadcn/ui-style component language while preserving the current color palette
- [x] 1.2 Add or refine any missing shared wrapper surfaces needed to keep controls consistent (for example dialogs, picker triggers, or related utility surfaces)

## 2. Page Adoption

- [x] 2.1 Replace high-impact raw controls in admin pages with the shared component layer
- [x] 2.2 Replace high-impact raw controls in public pages with the shared component layer
- [x] 2.3 Sweep remaining mixed button/select usage in shared components and route them through the unified primitives

## 3. Verification And Archive

- [x] 3.1 Add or update frontend tests covering the refreshed primitive usage in key admin/public pages
- [x] 3.2 Run frontend lint/test/build and browser verification for desktop/mobile compatibility; fix regressions
- [x] 3.3 Sync the approved spec changes back into `openspec/specs`, archive the change, and finish with a clean working tree
