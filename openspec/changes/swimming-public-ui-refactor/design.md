## Context

The swimming performance app has a Next.js 16 frontend (React 19, Tailwind CSS 4, Recharts, Radix UI) and a Flask/SQLite backend. The public portal currently shows:
- A hero section with comparison CTA
- Three metric cards (公开孩子 count, 对比准备 count, 访问场景)
- A two-column layout: swimmer directory cards + "你能看到什么" info panel
- Individual swimmer pages with line charts (raw/PB/trend), timeline, and goal progress bars
- A multi-swimmer comparison page

Key issues identified:
1. **Goals bug**: `repository.py:455` defaults `isPublic` to `False`; `services.py:157` filters `public_only=True` — admin-created goals never appear publicly unless `isPublic` is explicitly set
2. **No source type in public view**: `build_series()` strips performance data to just `performedOn` + `timeMs`, discarding `sourceType` from the context
3. **Millisecond-only input**: Admin records form uses raw `<input type="number">` for milliseconds
4. **Line charts**: Poor at showing swimming improvement deltas and goal distance

## Goals / Non-Goals

**Goals:**
- Clean, professional public UI with minimal clutter — one table/grid view for all swimmers
- Intuitive progress visualization: instantly see improvement amount and goal distance
- Fix goals visibility bug so admin-configured goals appear publicly
- Show performance source types in public timeline
- Smart time input supporting seconds format (e.g., `35.11` = 35.11s = 35110ms)
- Professional sports analytics color palette and typography

**Non-Goals:**
- Changing the backend data model or database schema
- Adding new API endpoints (reuse existing, augment response payloads)
- Mobile app or PWA features
- Real-time updates or WebSocket connections
- Changing admin page layouts beyond the time input improvement

## Decisions

### 1. Remove comparison page entirely
**Decision**: Delete `/compare` page, `CompareChart` component, and all comparison CTAs.
**Rationale**: User explicitly stated comparison with others is not meaningful; self-comparison via PB envelope and trend is sufficient. Reduces codebase complexity.
**Alternative considered**: Keep comparison but hide from nav — rejected because it adds dead code and user is clear about removal.

### 2. Replace line charts with bar-based improvement + gauge goal visualization
**Decision**: Use horizontal bar charts showing per-record improvement delta from first time, and radial gauge charts showing current position between baseline and target for goals.
**Rationale**: Line charts compress small time differences making progress hard to see. Bar charts with labeled deltas (e.g., "-2.3s from start") make improvement magnitude obvious. Radial gauges instantly communicate "how far to go" for goals.
**Implementation**: Use Recharts `BarChart` for improvement timeline and `RadialBarChart` for goal gauges. Keep raw data table for exact times.

### 3. Full-width swimmer table with team tabs on home page
**Decision**: Replace the two-column card grid + sidebar with a single full-width data table. Team filtering via horizontal tab strip above the table.
**Rationale**: Table format shows more swimmers at a glance, supports sorting, and removes visual noise. Tab switching is faster than filter buttons.
**Implementation**: Use existing Radix UI `Tabs` component for team switching. Build a responsive table that collapses to cards on mobile.

### 4. Fix goals `isPublic` default
**Decision**: Change the default `isPublic` from `False` to `True` in `repository.py:create_goal()`.
**Rationale**: Admin-created goals should be publicly visible by default — the admin can opt out if needed. Current behavior silently hides all goals from public view, which is a bug per user report.
**Alternative considered**: Add a UI hint in admin — rejected because changing default is simpler and matches user intent.

### 5. Add `sourceType` to public analytics response
**Decision**: Join `record_contexts` in the performances query to include `sourceType` per raw data point in the analytics response.
**Rationale**: Source type is already in the database; it just needs to surface through the API to the frontend.
**Implementation**: Modify `list_performances_for_swimmer_event()` to JOIN `record_contexts` and include `source_type`. Update `build_series()` to pass through `sourceType`. Frontend renders source badges in timeline.

### 6. Smart time input with unit toggle
**Decision**: Add a toggle switch (秒/毫秒) to the admin time input field. When in "秒" mode, input `35.11` is converted to `35110` ms before submission.
**Rationale**: Coaches think in seconds, not milliseconds. Supporting both modes with explicit toggle avoids ambiguity.
**Implementation**: Client-side conversion only. Backend continues to receive/store milliseconds. Conversion: `Math.round(parseFloat(value) * 1000)`.

### 7. Color palette and design system
**Decision**: Shift from the current blue-tinted palette to a professional sports analytics theme: deep navy primary (#0f172a), teal accent (#0ea5e9), warm grays for backgrounds, with clear data-ink ratio principles.
**Rationale**: Current palette feels generic. Sports analytics tools (like swimming federation dashboards) use darker, more confident palettes with high contrast data elements.
**Implementation**: Update Tailwind CSS custom properties in global CSS. No new dependencies.

## Risks / Trade-offs

**[Risk] Changing `isPublic` default may expose goals that admins intended to keep private** → Mitigation: This is a new system with few goals created; the user confirmed goals should be visible. The admin can still set `isPublic: false` when creating a goal.

**[Risk] Removing comparison page breaks existing bookmarks/links** → Mitigation: Add a redirect from `/compare` to home page with a toast message. Low risk since this is a small user base.

**[Risk] Chart type change loses trend line visibility** → Mitigation: Keep the PB envelope as an overlay on the improvement bars. Add a separate "trend summary" metric card showing improvement rate.

**[Risk] Source type JOIN adds query complexity** → Mitigation: The JOIN is on an indexed foreign key (`context_id`); performance impact is negligible for the data volumes in this app.
