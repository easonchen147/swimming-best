## Why

The current admin experience still has a few rough edges that break trust and polish: creating an existing event can silently fail or duplicate client state, quick actions on the dashboard do not clearly communicate what they trigger, birth year is still a free-text field, and native-looking select elements clash with the rest of the UI. These issues are small individually, but together they make the product feel inconsistent and brittle.

## What Changes

- Make duplicate event creation fail with an explicit "already exists" style message instead of silently reusing data and causing duplicate-key rendering issues.
- Refine the admin dashboard quick-actions area so quick record visibly communicates the action and its keyboard shortcut, without relying on a separate header hint.
- Change swimmer birth-year entry from free text to a selectable year picker.
- Upgrade shared select/dropdown styling so all admin/public selects align with the current visual language.
- Add regression coverage for duplicate event handling, quick-action rendering, year selection, and event-list deduplication.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `structured-events`: duplicate event submission should surface an explicit already-exists outcome and avoid duplicate UI state.
- `admin-dashboard-navigation`: quick actions must clearly communicate their purpose and shortcut affordances inside the quick-actions area.
- `swimmer-roster`: swimmer profile editing should support year selection through a constrained picker rather than open text entry.
- `uiux-modernization`: shared select controls must visually match the application's modern design language.

## Impact

- Affects backend event creation validation and frontend admin events state handling.
- Affects admin dashboard, swimmer roster form controls, and the shared select component.
- Adds or updates frontend and backend tests around duplicate event handling and improved form affordances.
