## MODIFIED Requirements

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support visibility controls and identity display
modes. Admin-facing roster summaries SHALL present those modes using product
language rather than raw internal enum values.

#### Scenario: Administrator scans the swimmer roster
- **WHEN** an administrator views swimmer rows in the admin roster table
- **THEN** visible-mode labels are presented as Chinese product text such as
  `昵称` or `真名`, and a fully hidden swimmer does not render a raw `hidden`
  mode label in the row summary
