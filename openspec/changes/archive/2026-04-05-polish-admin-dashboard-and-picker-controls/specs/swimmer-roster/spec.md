## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children. Birth year entry SHALL use a
year-focused picker interaction rather than a free-text field or a plain
dropdown.

#### Scenario: Administrator creates a swimmer with a managed team assignment
- **WHEN** an administrator submits a valid swimmer profile with a team
  identifier
- **THEN** the system stores the profile and associates it with the selected
  team

#### Scenario: Administrator updates a swimmer team assignment
- **WHEN** an administrator edits a swimmer and selects a different team
- **THEN** the system reflects the updated team assignment

#### Scenario: Administrator creates a swimmer with extended roster metadata
- **WHEN** an administrator submits a swimmer profile that includes supported
  roster metadata such as gender, notes, or birth year
- **THEN** the system stores and returns those fields through the admin API

#### Scenario: Administrator selects a birth year
- **WHEN** an administrator edits the birth-year field in the swimmer form
- **THEN** the UI offers a year-focused picker interaction instead of plain
  text entry or a simple dropdown
