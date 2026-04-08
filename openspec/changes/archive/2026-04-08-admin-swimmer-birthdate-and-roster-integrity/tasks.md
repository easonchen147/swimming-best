## 1. Birth Date Data Layer

- [x] 1.1 Add a backward-compatible `birth_date` column and startup migration for existing swimmer databases
- [x] 1.2 Normalize `birthDate` / `birthYear` handling in the repository and keep admin payloads round-trippable
- [x] 1.3 Add backend tests covering exact-date persistence, legacy year-only compatibility, and DB migration safety

## 2. Admin Birth Date Interaction

- [x] 2.1 Add a shared shadcn-style calendar primitive and refactor the shared date picker to use it
- [x] 2.2 Switch the admin swimmer form from birth-year picking to birth-date picking with placeholder `请选择`
- [x] 2.3 Remove obsolete birth-year helper copy and update frontend tests for date selection and submission

## 3. Roster Correctness And Table Cleanup

- [x] 3.1 Fix the hidden-to-public swimmer edit flow so admins can restore public visibility
- [x] 3.2 Simplify the swimmer roster table identity block, keep desktop columns aligned, and remove the download action
- [x] 3.3 Update API/type/page tests covering the repaired edit flow and roster UI expectations

## 4. Verification And Closeout

- [x] 4.1 Run targeted backend tests, frontend tests, lint, and production build
- [x] 4.2 Manually verify implementation against proposal, design, tasks, and spec deltas because `opsx:verify` is unavailable
- [x] 4.3 Archive the change, compound the learning, and create the final git commit
