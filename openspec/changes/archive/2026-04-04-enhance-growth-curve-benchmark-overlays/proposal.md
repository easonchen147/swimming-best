## Why

The public swimmer analytics currently split progress, official grades, and goals into separate cards, while the main chart only overlays custom benchmark lines. That makes it hard for children, parents, and coaches to immediately answer the core question for a specific event: how far is the swimmer from their own goal and from each applicable official athlete grade right now.

## What Changes

- Extend public event analytics so the backend returns chart-ready official grade thresholds for the swimmer's gender and selected event, plus public goal overlays and explicit gap summaries.
- Upgrade the public swimmer/event growth visualization so one chart clearly combines performance progression, PB markers, official grade lines, public goal lines, and existing custom standards.
- Add a compact "remaining gap" summary that highlights how many seconds remain to each public goal and each official grade tier.
- Preserve mobile readability for the richer analytics layout and add regression coverage for the new payload and rendering behavior.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `official-grade-baseline`: public analytics must expose all applicable official grade thresholds for the swimmer gender and event, not only the current and next grade.
- `progress-goals`: public goal analytics must provide chart overlay and gap-summary data for visible swimmer goals on the selected event.
- `progress-visualization`: swimmer growth charts must show a unified progression view with official-grade and goal benchmark overlays plus readable progress-gap summaries.
- `public-performance-portal`: public swimmer and event detail pages must expose the richer benchmark-aware growth view without requiring login.
- `responsive-ui`: the richer chart, legend, and gap summary layout must remain readable and non-overflowing on phone-sized viewports.

## Impact

- Affects `backend/swimming_best/services.py`, official grade helper usage, and public analytics tests.
- Affects frontend public analytics pages, shared chart/types components, and public-facing tests.
- Changes the public analytics response contract by adding new benchmark and gap summary fields that the frontend consumes directly.
