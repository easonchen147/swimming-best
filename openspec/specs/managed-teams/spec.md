# managed-teams Specification

## Purpose
定义管理员维护受管 team 实体，并用统一、稳定的 team 目录取代旧的自由文本分组，
确保后台分配、筛选以及公开展示都引用同一份受管数据。

## Requirements
### Requirement: The system SHALL manage first-class team entities
The system SHALL allow administrators to create, list, and update team entities
that are managed independently from swimmer profiles. Team entities MUST have a
stable identifier and a unique name, and MUST NOT be hardcoded to example values
such as `A`, `B`, or `C`.

#### Scenario: Administrator creates a managed team
- **WHEN** an administrator submits a valid new team name
- **THEN** the system stores a new team entity with its own identifier and makes
  it available to swimmer assignment workflows

#### Scenario: Administrator updates a managed team
- **WHEN** an administrator edits an existing team entity and changes its name or
  status
- **THEN** the system persists the updated team entity and subsequent swimmer and
  roster payloads reflect the updated team details

### Requirement: The system SHALL expose managed teams for admin selection
The system SHALL provide an admin-facing team directory API that returns the
current managed teams for dashboard counts, swimmer assignment, and roster
filtering workflows. The admin team directory SHALL also include the current
swimmer count for each managed team so operators can quickly understand team
size without opening another page.

#### Scenario: Administrator requests the managed team list
- **WHEN** an authenticated administrator requests the team directory
- **THEN** the system returns the managed teams with stable identifiers and
  display data needed by admin workflows, plus each team's current swimmer
  count

### Requirement: Managed team directory SHALL support query-backed search
The admin team directory SHALL support a visible search control whose results
are backed by a backend-recognized search parameter.

#### Scenario: Administrator searches managed teams
- **WHEN** an administrator enters a team name fragment in the team-directory
  search box
- **THEN** the admin team request includes that search value and the rendered
  team cards only show matching teams
