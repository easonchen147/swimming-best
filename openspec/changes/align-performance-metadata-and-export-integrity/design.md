## Context

The current repository persists fields such as swimmer avatar URL, birth year, notes, context location, public/admin notes, and goal hierarchy metadata. However, the admin UI and API clients only send a subset of those fields, so many stored values remain defaults forever. Separately, the team export code computes PB from all times, while analytics explicitly uses valid results only, which creates a correctness mismatch.

## Goals / Non-Goals

**Goals:**
- Identify which dormant schema fields are product-facing and expose them through the admin experience.
- Keep purely internal or future-facing fields out of the operator workflow unless they now serve a clear purpose.
- Make export PB status match analytics validity rules.
- Add coverage proving persisted metadata survives round-trips through the API.

**Non-Goals:**
- Rebuild the entire data model or remove fields wholesale without evidence.
- Introduce new entities beyond the existing schema.
- Expand export formats beyond fixing the current CSV consistency gap.

## Decisions

### Decision: Surface only operator-relevant dormant fields

Not every field needs a form control, but fields that already imply operator intent (`gender`, `birthYear`, `notes`, `location`, `publicNote`, `adminNote`, `isPublic`) should be surfaced if they materially affect display or analysis.

### Decision: Treat export PB as an analytics-consistent derived value

The CSV export should not invent a different PB rule. It should reuse the same "valid result only" concept already used by analytics so operators do not see conflicting truths between screens and exports.

### Decision: Keep unsupported metadata explicit

If a field remains internal-only after review, the implementation should keep it out of the admin clients and the docs should make that boundary clear, so future contributors do not assume the UI simply forgot it by accident.

## Risks / Trade-offs

- `[Too many new form fields create noisy admin pages]` → expose only fields with clear operator value and keep others internal.
- `[API payload expansion causes frontend drift]` → update shared types and add round-trip tests.
- `[Changing export PB logic surprises existing users]` → align docs and tests around the valid-only rule used everywhere else.

