## Why

The current frontend already has a partial design system, but it still mixes multiple visual idioms: some surfaces use custom glass cards, some controls still feel closer to native elements, and several pages use raw HTML buttons or selects instead of a unified component layer. This makes the public pages and admin pages feel inconsistent even though the product's color direction is already settled.

## What Changes

- Refactor the shared UI primitives so buttons, cards, inputs, selects, badges, tables, dialogs, and picker triggers follow a unified shadcn/ui-style component language while preserving the existing color palette.
- Replace remaining high-impact raw controls in admin/public pages with the shared component layer so the application reads as one consistent system.
- Keep the current product colors and overall brand direction intact; this change only standardizes component structure, spacing, states, and interaction patterns.
- Verify that the upgraded component layer remains usable on both desktop and mobile layouts.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `uiux-modernization`: the global component language and interaction patterns change to a shadcn/ui-style system while preserving the existing color palette.
- `public-performance-portal`: public pages must use the unified component layer instead of mixed raw controls and ad-hoc surfaces.
- `admin-dashboard-navigation`: admin quick actions and surrounding surfaces must use the unified component layer.
- `responsive-ui`: the unified component layer must remain compatible with both desktop and mobile layouts.

## Impact

- Affects shared UI primitives under `frontend/src/components/ui/**` and selected shared/admin/public components that still bypass those primitives.
- Affects both public and admin pages, especially shell/header actions, list filters, buttons, and selection controls.
- Requires frontend regression coverage and browser verification because the change is broad but intentionally styling-focused rather than logic-focused.
