---
title: Keep exact admin-only dates alongside a compatible derived year
date: 2026-04-08
category: docs/solutions/best-practices
module: admin swimmer roster
problem_type: best_practice
component: database
severity: medium
applies_when:
  - an existing table only stores year-level metadata and the product now needs an exact date
  - public or downstream consumers should not automatically receive the new exact field
  - historical records must remain trustworthy after schema upgrades
tags: [birthdate, backward-compatibility, sqlite, admin-roster, metadata]
---

# Keep exact admin-only dates alongside a compatible derived year

## Context

`backend/swimming_best/db.py` and `backend/swimming_best/repository.py` originally
stored swimmer birth metadata only as `birth_year`. The admin workflow then
needed exact month/day support, but the system already had historical data and
other logic still depended on year-based age buckets.

## Guidance

When a product moves from coarse metadata to precise metadata, do not replace
the old field outright if other flows still depend on it. Instead:

1. Add a new exact field at the schema layer, such as `birth_date`.
2. Keep the coarse field, such as `birth_year`, as a compatibility field.
3. Centralize normalization in one backend boundary so every create/update path
   follows the same precedence rules.
4. Expose the exact field only where it is actually needed. In this repo that
   means admin swimmer payloads can return `birthDate`, while public swimmer
   payloads still expose only `birthYear`.
5. Never fabricate precision for legacy rows. A historical `2016` must remain
   “known year only”, not silently become `2016-01-01`.

## Why This Matters

This pattern avoids three common failures at once:

- accidental data corruption during migration
- inconsistent create/update semantics between old and new clients
- privacy drift where a newly added exact date leaks into public payloads just
  because the repository started returning it everywhere

By deriving `birthYear` from `birthDate` only when an exact date is explicitly
saved, the system gains precision without breaking age-bucket logic or older
records.

## When to Apply

- A schema currently stores only a year, month, or summary field.
- The new UI needs exact values, but old data is incomplete.
- Downstream logic still consumes the coarse field.
- The exact field is more sensitive than the coarse field and should stay
  scoped to admin-only views.

## Examples

Before:

- `backend/swimming_best/db.py` only defined `swimmers.birth_year`
- `backend/swimming_best/repository.py` only accepted `birthYear`

After:

- `backend/swimming_best/db.py` adds `birth_date` with a startup migration
- `backend/swimming_best/repository.py` normalizes `birthDate` and `birthYear`
  in one place
- `frontend/src/app/admin/swimmers/page.tsx` submits `birthDate`
- public routes continue to omit the exact field

## Related

- `docs/plans/2026-04-08-001-feat-admin-swimmer-birthdate-and-roster-integrity-plan.md`
- `openspec/specs/swimmer-roster/spec.md`
