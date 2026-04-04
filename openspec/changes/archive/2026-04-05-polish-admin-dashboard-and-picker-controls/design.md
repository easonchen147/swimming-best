## Context

The product's current admin experience is largely functional, but some of the most visible controls still feel disconnected from the rest of the design system. The dashboard mixes shortcut hints between header and quick-actions, the process guidance is visually flat, and date-related entry is inconsistent between birth year and record dates. At the runtime layer, the backend currently prefers Waitress, but the deployment target is Linux, so the repository should prefer Gunicorn for Linux-facing startup flows.

## Goals / Non-Goals

**Goals:**
- Make the admin dashboard quick-actions area self-contained, readable, and visually intentional.
- Replace the flat management guidance with a connected process-flow presentation.
- Introduce a shared picker-style control pattern for year-only and date selection.
- Keep select and picker surfaces visually aligned with the modern card/input language.
- Switch Linux-oriented backend startup and documentation to Gunicorn.

**Non-Goals:**
- Introduce a full scheduling/calendar system.
- Rebuild unrelated admin/public pages that do not consume the shared controls.
- Change business logic or API contracts unrelated to the UI/runtime concerns above.

## Decisions

### Decision: Use shared popover-based picker controls for both date and year selection

Rather than mixing plain selects and native date inputs, the frontend should use a common picker shell built on the existing Radix popover primitive. That gives us a consistent trigger surface, shared styling, and separate rendering strategies for full dates and year-only selection.

Alternative considered:
- Keep native controls and only restyle them. Rejected because the year-only requirement is better expressed as a dedicated year picker, and the current interaction mismatch would remain.

### Decision: Render dashboard guidance as a connected process flow

The recommended management path should be visually sequential, with connectors and directional cues, instead of four unrelated cards.

Alternative considered:
- Leave the card grid in place and only adjust copy. Rejected because it does not address the user's specific request for a flowchart-like presentation.

### Decision: Remove the top shortcut hint and move all quick-record affordance into quick actions

The header should only hold navigation-level actions. Shortcut education belongs with the action itself, so the quick-actions area should own both the label and the shortcut hint.

### Decision: Prefer Gunicorn on Linux-facing startup paths while keeping local compatibility

The shell launcher and docs should prefer Gunicorn because they target Linux deployment. For non-Linux local environments, the Python module entrypoint can keep a compatibility path so local workflows do not break.

Alternative considered:
- Keep Waitress as the default everywhere. Rejected because it does not align with the stated Linux deployment target.

## Risks / Trade-offs

- `[Custom picker controls can introduce accessibility regressions]` -> Reuse Radix popover semantics and add targeted tests around trigger/selection behavior.
- `[Flowchart layout becomes too dense on mobile]` -> Use a vertical timeline/flow layout with responsive stacking.
- `[Gunicorn-first docs confuse Windows local use]` -> Make Linux-facing defaults explicit in docs and keep a local fallback path documented.

## Migration Plan

1. Add shared picker components and wire birth-year and date fields to them.
2. Refine dashboard header and quick-actions, then replace the current guidance card list with a connected process view.
3. Switch backend startup dependency/docs/script preference to Gunicorn for Linux-facing workflows.
4. Run frontend lint/test/build and backend pytest/ruff before archive.

## Open Questions

- None. The work is implementation-focused.
