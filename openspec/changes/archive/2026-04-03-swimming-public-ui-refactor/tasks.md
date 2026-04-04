## 1. Backend: Fix Goals Default and Add Source Type to Analytics

- [x] 1.1 Change `isPublic` default from `False` to `True` in `repository.py:create_goal()` (line 455)
- [x] 1.2 Modify `list_performances_for_swimmer_event()` in `repository.py` to JOIN `record_contexts` and include `source_type` in the returned performance dict
- [x] 1.3 Update `build_series()` in `analytics.py` to pass through `sourceType` in each raw data point
- [x] 1.4 Add backend tests for goals `isPublic` default and sourceType in analytics response

## 2. Frontend: Smart Time Input for Admin Records

- [x] 2.1 Create a `TimeInput` component with unit toggle (秒/毫秒) that converts seconds input to milliseconds
- [x] 2.2 Replace raw millisecond `<input>` in admin records page (`admin/records/page.tsx`) with the new `TimeInput` component
- [x] 2.3 Add unit tests for the time conversion logic (e.g., `35.11` → `35110`)

## 3. Frontend: Remove Comparison Feature

- [x] 3.1 Delete the compare page (`app/compare/page.tsx`) and `CompareChart` component
- [x] 3.2 Remove comparison CTA buttons and links from home page and swimmer detail page
- [x] 3.3 Add a redirect from `/compare` to `/` in Next.js config or via a minimal page
- [x] 3.4 Remove compare-related API client function from `lib/api/public.ts`

## 4. Frontend: Public Home Page Redesign

- [x] 4.1 Redesign `PublicShell` header: clean professional title bar with app name and minimal navigation
- [x] 4.2 Remove hero section, metric cards (公开孩子/对比准备/访问场景), and "你能看到什么" sidebar from home page
- [x] 4.3 Build full-width swimmer table component with columns: display name, team, best event, action link
- [x] 4.4 Add team tab strip using Radix Tabs for filtering swimmers by team
- [x] 4.5 Implement responsive table-to-card collapse for mobile viewports
- [x] 4.6 Update global color palette: navy primary (#0f172a), teal accent (#0ea5e9), warm gray backgrounds in Tailwind CSS custom properties

## 5. Frontend: Progress Visualization Redesign

- [x] 5.1 Create `ImprovementChart` component: horizontal bar chart showing improvement deltas from first time, with PB markers
- [x] 5.2 Create `GoalGauge` component: radial/arc gauge showing baseline → current → target with labeled time values
- [x] 5.3 Replace `PerformanceChart` usage in swimmer detail and event detail pages with `ImprovementChart`
- [x] 5.4 Replace goal progress bars in swimmer detail and event detail pages with `GoalGauge`

## 6. Frontend: Source Type Display in Public Timeline

- [x] 6.1 Update TypeScript types in `lib/types.ts` to include `sourceType` in raw performance data points
- [x] 6.2 Add source type badge component with distinct colors per type (比赛=highlighted, 训练=neutral, 测试=muted, 临时记录=minimal)
- [x] 6.3 Render source type badges in the public timeline entries on swimmer detail and event detail pages

## 7. Testing and Verification

- [x] 7.1 Run all existing frontend tests (Vitest) and fix any failures from removed/refactored components
- [x] 7.2 Run all existing backend tests (Pytest) and fix any failures from modified endpoints
- [x] 7.3 Verify public page loads correctly with swimmer table, team tabs, and new visualizations
- [x] 7.4 Verify goals appear on public page after admin creation (isPublic fix)
- [x] 7.5 Verify source type badges display correctly in public timeline
- [x] 7.6 Verify smart time input converts seconds to milliseconds correctly in admin records form
