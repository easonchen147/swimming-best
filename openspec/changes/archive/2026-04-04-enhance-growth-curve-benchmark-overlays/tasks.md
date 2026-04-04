## 1. Backend Analytics Contract

- [x] 1.1 Extend public event analytics to return ordered official benchmark thresholds with achieved/gap metadata for the selected swimmer gender and event
- [x] 1.2 Extend public goal analytics to expose gap/achieved metadata that can drive chart overlays and gap summaries without extra requests
- [x] 1.3 Add backend regression tests covering official benchmark thresholds, gender scoping, and public goal filtering/gap metadata

## 2. Public Growth Visualization

- [x] 2.1 Replace the delta-only improvement chart with a benchmark-aware growth curve that plots times, PB progress, and multiple benchmark sources
- [x] 2.2 Add a reusable gap summary/legend presentation for official grades and public goals, then wire it into the public swimmer and event-detail pages
- [x] 2.3 Ensure the richer public analytics layout stays readable on mobile and clean up touched public-facing Chinese copy/encoding issues

## 3. Verification And Spec Sync

- [x] 3.1 Add or update frontend tests for the growth chart and gap summary behavior
- [x] 3.2 Run frontend lint/test/build plus backend pytest and ruff, then fix any regressions
- [x] 3.3 Sync the approved spec changes back into `openspec/specs`
