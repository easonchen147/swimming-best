## 1. Swimmer Roster Density

- [x] 1.1 Rebalance the desktop swimmer table column widths to avoid unnecessary horizontal scrolling
- [x] 1.2 Replace raw mode labels with Chinese UI text and suppress the extra hidden-mode label
- [x] 1.3 Update swimmer roster page tests to cover the new label behavior

## 2. Managed Team Card Signal

- [x] 2.1 Add `swimmerCount` to admin team list payloads
- [x] 2.2 Replace `Order` display in team cards with swimmer count and rename the active-state text to `有效`
- [x] 2.3 Add backend/frontend tests covering the new team-card metric

## 3. Shared Date Picker Cleanup

- [x] 3.1 Simplify the shared date-picker popover shell to a lighter single-surface structure
- [x] 3.2 Tune the shared calendar classNames so the dropdown, nav, and day grid read as one panel
- [x] 3.3 Update shared picker tests and verify affected admin pages still use the common component cleanly

## 4. Verification And Closeout

- [x] 4.1 Run targeted tests plus full frontend lint/test/build and backend lint/test
- [x] 4.2 Manually verify implementation against proposal, design, tasks, and spec deltas because `opsx:verify` is unavailable
- [x] 4.3 Archive the change, compound the learning if warranted, and create the final git commit
