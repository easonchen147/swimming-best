## Why

The current implementation exposes compare analytics in the backend but does not ship a public compare page in the frontend, and the admin dashboard's quick actions look interactive without actually navigating anywhere. Mobile layouts also render the core pages without horizontal overflow, but chart containers still emit sizing warnings, which indicates the responsive implementation is incomplete.

## What Changes

- Add a public compare page that consumes the existing compare API and lets visitors compare multiple swimmers on the same event.
- Make admin dashboard quick actions navigate to the corresponding working pages instead of acting as decorative buttons.
- Stabilize chart containers and page layouts so key public/admin pages render cleanly on phone-sized viewports without chart sizing warnings.
- Add regression coverage for compare page routing, admin shortcut navigation, and responsive chart rendering.

## Capabilities

### New Capabilities
- `admin-dashboard-navigation`: actionable shortcut navigation and workflow entry points from the admin dashboard.

### Modified Capabilities
- `public-performance-portal`: complete the public compare experience in the frontend and ensure the backend compare API is consumable end-to-end.
- `responsive-ui`: tighten the responsive behavior for chart-heavy pages so mobile viewports avoid overflow and unstable chart sizing.
- `progress-visualization`: ensure compare/progress chart containers render with stable dimensions in real page layouts.

## Impact

- Affects frontend public/admin routes, shared chart components, and API client wiring.
- May require small backend payload adjustments or route additions only if the current compare payload is insufficient.
- Adds browser-visible functional coverage for compare flows and dashboard navigation.

