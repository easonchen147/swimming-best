## 1. Admin Navigation And Dashboard Polish

- [x] 1.1 Update the admin shell header to render “查看公开页” and “退出登录” as shared action buttons and wire the logout action to the existing admin logout API.
- [x] 1.2 Add icons to all admin sidebar navigation items and preserve white icon/text contrast for the active item on desktop and mobile menus.
- [x] 1.3 Restyle the admin dashboard quick-actions panel and its three entry buttons so the surface and text treatment match the main dashboard cards.

## 2. Public Navigation And Compare Flow

- [x] 2.1 Update the public shell header so home, compare, and admin entry all render as differentiated buttons with responsive mobile layout.
- [x] 2.2 Refactor the compare page to require explicit swimmer and event selection, remove default swimmer preselection, and show empty-state messaging before compare results are requested.
- [x] 2.3 Update or add frontend tests covering the admin header/sidebar behavior and the compare page selection-state behavior.

## 3. Verification And Spec Sync

- [x] 3.1 Run frontend lint, unit tests, production build, and targeted browser verification for the affected pages.
- [x] 3.2 Sync the finalized behavior back into the main OpenSpec capability specs before archiving the change.
