## Context

The frontend has steadily gained more polish, but it still does not feel like one component system. Core primitives such as `Button`, `Input`, `Card`, `Select`, and `Table` are custom and visually close to the target in some places, yet many pages still render raw `button` or `select` elements, and some surfaces use unique patterns that do not match the rest of the app. The user explicitly wants a shadcn/ui-style component language across both public and admin pages, while preserving the current color palette and keeping desktop/mobile compatibility.

## Goals / Non-Goals

**Goals:**
- Move the app closer to a unified shadcn/ui-style primitive layer without changing the established product colors.
- Reduce the number of raw page-level controls by routing the main user interactions through shared UI primitives.
- Keep admin and public pages visually consistent on both desktop and mobile.
- Preserve existing business logic and API behavior.

**Non-Goals:**
- Rebrand the product or change the current color palette.
- Replace every single custom component with a third-party package-generated file if an internal equivalent can be made style-compatible.
- Rewrite unrelated business logic or data flows.

## Decisions

### Decision: Refactor the existing `frontend/src/components/ui` primitives instead of introducing a second parallel library

The repo already routes most higher-level UI through `Button`, `Card`, `Input`, `Select`, `Badge`, and `Table`. Refactoring those primitives to align with shadcn/ui-style structure and states is less risky than dropping in a second competing component layer.

### Decision: Sweep raw high-impact controls after the primitive refresh

Some pages still use raw `button` and `select` elements. After refreshing the primitives, replace the most visible raw controls in shells, public entry pages, compare page, and admin forms so the app feels consistently component-driven.

### Decision: Preserve color tokens and only standardize component anatomy

The user explicitly does not want a color redesign. The implementation should therefore keep the current CSS variables and tonal direction while aligning borders, radii, shadows, spacing, focus states, and content structure with the shadcn/ui style system.

### Decision: Treat responsive integrity as a hard constraint

Because this is a broad UI-layer change, the new primitives must be validated on both desktop and mobile layouts before archive.

## Risks / Trade-offs

- `[Broad primitive changes can ripple through many pages]` -> Change core primitives carefully and validate with build, unit tests, and browser tests.
- `[Trying to mimic shadcn/ui too literally could fight existing motion patterns]` -> Align the component structure and states to shadcn/ui while preserving the app's existing motion layer where it already adds value.
- `[Raw controls may remain in obscure pages]` -> Prioritize high-traffic/admin-critical pages first and search the repo for remaining raw controls before final verification.

## Migration Plan

1. Refresh shared UI primitives to the target component language.
2. Replace remaining high-impact raw controls across admin/public pages.
3. Run frontend lint/test/build and browser verification on desktop/mobile.
4. Sync specs and archive once the app reads consistently as one component system.

## Open Questions

- None. The work is implementation-focused.
