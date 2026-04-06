## 1. Arena Detail-First Restructure

- [x] 1.1 Refactor `frontend/src/components/arena/arena-page.tsx` so the arena uses a lighter race selector plus one primary race detail surface
- [x] 1.2 Replace the “焦点赛道” summary card with a selected-race metric that explains the current group
- [x] 1.3 Update `frontend/src/components/arena/arena-leaderboards.tsx` and related copy/tests to match the detail-first arena model

## 2. Public Swimmer Detail Layout And Share Export

- [x] 2.1 Expand the public swimmer detail export container in `frontend/src/app/swimmers/[slug]/page.tsx` to include hero, metrics, and analytics content
- [x] 2.2 Normalize vertical spacing between the public swimmer hero, metric cards, and analytics sections across desktop and mobile
- [x] 2.3 Adjust `frontend/src/components/shared/public-event-analytics-view.tsx` as needed so the unified export container remains readable and export-safe

## 3. Verification And Closeout

- [x] 3.1 Update or add frontend tests covering the revised arena structure and full-growth poster export behavior
- [x] 3.2 Run frontend lint, tests, and production build; fix any regressions uncovered during verification
- [x] 3.3 Finalize the OpenSpec change artifacts and prepare the implementation for archive and git commit
