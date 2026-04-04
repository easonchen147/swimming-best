## Why

The public-facing swimming performance portal is overcrowded with unnecessary metrics ("公开孩子个数", "对比准备", "访问场景", "你能看到什么"), uses a cluttered layout, and lacks professional visual design. The comparison page adds complexity without clear value. Additionally, goals configured in admin are invisible on the public page due to a `is_public` default bug, performance source types are hidden from the public view, time entry requires raw milliseconds which is tedious, and the current line charts are poor at conveying swimming progress and goal distance at a glance.

## What Changes

- **BREAKING**: Remove the multi-swimmer comparison page (`/compare`) and all related UI elements (compare button on home page, compare chart component, compare API client calls)
- Redesign public home page: remove metric cards (公开孩子/对比准备/访问场景) and "你能看到什么" sidebar; replace with a clean full-width table/grid of all swimmer profiles with team tab switching
- Redesign public header/title bar for a clean, professional look
- Overhaul color palette and typography for a professional sports analytics aesthetic
- Redesign performance visualization: replace line charts with bar-based improvement visualization and gauge/progress indicators for goal distance
- Fix goals visibility bug: goals created in admin default `isPublic: false`, so public analytics never returns them; change default or add admin UI hint
- Add performance source type display (训练/测试/比赛/临时记录) to public timeline entries
- Add smart time input in admin records page: support seconds format (e.g., `35.11` → `35110ms`) alongside raw milliseconds, with a unit toggle

## Capabilities

### New Capabilities
- `smart-time-input`: Dual-mode time input (seconds with decimals or raw milliseconds) for admin performance recording
- `source-type-display`: Display performance source type (training/test/competition/single) in public-facing timeline and analytics views
- `progress-visualization`: New chart designs for swimming progress — bar-based improvement deltas and gauge-style goal distance indicators replacing line charts

### Modified Capabilities
- `public-performance-portal`: Complete UI/UX redesign — remove comparison feature, remove clutter metrics, add full-width swimmer table with team tabs, redesign header, overhaul color scheme and layout
- `progress-goals`: Fix `isPublic` default so admin-created goals appear on public pages; redesign goal display from progress bars to visual gauge indicators showing baseline → current → target

## Impact

- **Frontend**: Major changes to `page.tsx` (home), `swimmers/[slug]/page.tsx`, `swimmers/[slug]/events/[eventId]/page.tsx`, `components/charts/`, `components/layout/public-shell.tsx`. Removal of `compare/page.tsx` and `components/charts/compare-chart.tsx`. New chart components for progress visualization. Updated admin records form with time unit toggle.
- **Backend**: Minor change to `repository.py` `create_goal()` default for `isPublic`. Add `sourceType` to public analytics performance data in `services.py`.
- **API**: Public analytics endpoint response gains `sourceType` field per raw performance point. Compare endpoint becomes unused.
- **Dependencies**: No new dependencies; Recharts remains but with different chart types (BarChart, RadialBarChart instead of LineChart).
