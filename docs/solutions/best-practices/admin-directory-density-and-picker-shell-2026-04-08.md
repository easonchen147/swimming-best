---
title: Keep admin directory cards focused and shared date pickers visually thin
date: 2026-04-08
category: docs/solutions/best-practices
module: admin roster and picker UI
problem_type: best_practice
component: tooling
severity: medium
applies_when:
  - an admin directory card is showing metadata that exists mainly for system maintenance rather than daily operations
  - a shared date picker starts to look like multiple nested cards instead of one popover
tags: [admin-ui, date-picker, shadcn, roster-density, team-metrics]
---

# Keep admin directory cards focused and shared date pickers visually thin

## Context

The admin swimmer roster and team directory were functionally correct, but they
still carried low-value display choices:

- swimmer table columns were too generous to the name cell, pushing the table
  toward horizontal scrolling
- roster mode text exposed raw internal values like `nickname` and `hidden`
- team cards highlighted `Order` instead of the operationally useful swimmer
  count
- the shared date picker added enough extra chrome that the popover felt like
  multiple stacked components

## Guidance

- In admin lists, prioritize the information an operator needs to scan quickly.
  Internal maintenance fields such as sort order can stay editable without
  being promoted into the main browse surface.
- If a backend directory card benefits from a count metric, return that count
  from the backend payload instead of making the frontend infer it from another
  list.
- For shared date pickers built on shadcn/Radix, stay close to the official
  `trigger -> popover -> calendar` composition. Extra headings, extra card
  shells, and repeated backgrounds make the picker feel visually heavy across
  every page that reuses it.
- Use product-language labels in roster tables. UI should show `昵称` and `真名`
  instead of raw enum values.

## Why This Matters

These are small choices individually, but they compound in high-frequency admin
pages. When a directory card shows the wrong metric, or a shared picker adds an
extra visual layer, the interface feels busier than the product actually is.
Returning `swimmerCount` from the team directory and keeping the date-picker
popover to a single clear surface both reduce that friction without changing
core behavior.

## When to Apply

- You are refining an existing admin roster or directory view.
- The page already works functionally, but scanning or basic selection feels
  heavier than it should.
- A shared picker or overlay is reused across multiple workflows and visual
  problems repeat everywhere it appears.

## Examples

Before:

- `frontend/src/app/admin/teams/page.tsx` showed `Order` in the managed-team
  cards.
- `frontend/src/components/shared/date-picker.tsx` added a titled outer shell
  around the calendar, making the popover look double-layered.

After:

- `backend/swimming_best/repository.py` returns `swimmerCount` in team list
  payloads.
- `frontend/src/app/admin/teams/page.tsx` shows `队员数` and `有效`.
- `frontend/src/components/shared/date-picker.tsx` uses a lighter single-surface
  popover structure.

## Related

- `docs/plans/2026-04-08-002-feat-admin-roster-and-picker-polish-plan.md`
- `openspec/specs/managed-teams/spec.md`
- `openspec/specs/uiux-modernization/spec.md`
