## Why

The current schema stores richer metadata than the UI can actually enter or edit, which means multiple fields stay at default values even though the product model implies they should be meaningful. Export logic also diverges from analytics logic by treating every recorded time as PB-eligible, which can produce inconsistent operator-facing CSV output.

## What Changes

- Audit stored metadata fields for swimmers, record contexts, performances, and goals, and promote the ones that should be operator-managed into real frontend/API flows.
- Leave clearly internal-only fields internal, but document or constrain them so they are not mistaken for end-user-editable state.
- Align export PB calculation with the same valid-result rules used by analytics.
- Add regression coverage for metadata persistence and export consistency.

## Capabilities

### New Capabilities
- `metadata-completion`: explicit operator support for schema fields that are intended to be edited rather than silently defaulted.

### Modified Capabilities
- `swimmer-roster`: broaden swimmer data capture to cover the intended roster metadata that is currently persisted but not surfaced.
- `performance-recording`: expose intended context/performance metadata fields where they matter operationally.
- `progress-goals`: clarify and persist goal metadata that should be operator-managed.
- `data-import-export`: ensure PB markings and export payloads use the same validity rules as analytics.

## Impact

- Affects backend repository/service behavior, admin API payload shapes, and admin forms.
- Touches CSV export logic and field-level persistence tests.
- May add limited UI controls for fields that already exist in the schema.

