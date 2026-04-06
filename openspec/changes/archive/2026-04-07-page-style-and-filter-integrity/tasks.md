## 1. Query Integrity

- [x] 1.1 Add `search` support to admin/public list routes, services, and repository queries for teams, swimmers, events, and public swimmers
- [x] 1.2 Update frontend admin/public API clients to accept the new search/filter inputs and cover them in client tests
- [x] 1.3 Wire the public home page and admin teams/swimmers/events pages to use real query-backed search and filter requests

## 2. UI Primitive Alignment

- [x] 2.1 Add a shared Radix checkbox primitive and replace the remaining native checkboxes in key admin forms
- [x] 2.2 Wrap manual select menus with the proper shared Radix select grouping structure and keep their theme styling aligned
- [x] 2.3 Audit the touched pages for color, spacing, and component-family consistency with the current theme

## 3. Public Growth Page Polish

- [x] 3.1 Normalize the vertical spacing rhythm on the public swimmer detail page and its analytics composition
- [x] 3.2 Upgrade “保存分享海报” to export the full growth page as a long image with explicit export dimensions
- [x] 3.3 Add or update tests covering long-image export and page-level query-backed filtering behavior

## 4. Verification And Closeout

- [x] 4.1 Run backend tests covering admin/public query filters and fix any failures
- [x] 4.2 Run frontend lint, tests, and production build and fix any regressions
- [x] 4.3 Verify the change against its specs, archive it, and prepare the final git commit
