## Why

The current admin UI still has a few high-visibility polish gaps: the dashboard quick-actions card does not present quick record cleanly, the header repeats a shortcut hint that no longer belongs there, the workflow section still reads like a flat list instead of a visual process, and date-related controls are inconsistent between birth-year and performance-date entry. On the backend side, the startup path now avoids Flask development warnings, but the default Linux-oriented deployment target should use Gunicorn rather than Waitress.

## What Changes

- Refine the admin dashboard quick-actions area so the quick-record action has visible, readable copy and shortcut affordance, remove the redundant header shortcut hint, and restyle the "查看公开页" action as a real button.
- Replace the flat "推荐管理流程" presentation with a flowchart-style management path.
- Introduce shared picker-style controls for date and year selection so swimmer birth year and record dates align visually with the rest of the design system.
- Upgrade shared select and picker surfaces to match the current modern card/input aesthetic.
- Switch the Linux-oriented backend startup path from Waitress to Gunicorn while preserving a Windows-friendly fallback for local development if needed.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `admin-dashboard-navigation`: dashboard quick actions and management-flow presentation change.
- `swimmer-roster`: swimmer birth-year entry moves from a simple constrained selector to a year-focused date-picker interaction.
- `performance-recording`: record-date entry uses the shared picker-style date control.
- `uiux-modernization`: shared select/picker controls and action surfaces are visually upgraded for consistency.
- `python-backend-runtime`: the documented Linux-oriented backend server runtime changes from Waitress to Gunicorn.

## Impact

- Affects admin dashboard layout, shared form controls, swimmer and record entry pages.
- Affects backend dependency/runtime selection, startup docs, and shell launcher behavior.
- Requires frontend regression coverage for dashboard actions and picker behavior, plus backend runtime verification.
