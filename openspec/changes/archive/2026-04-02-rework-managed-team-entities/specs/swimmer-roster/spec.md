## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children within one installation. Each swimmer
profile MUST reference one managed team entity, and the system MUST persist that
association as structured data rather than a free-text team/group field.

#### Scenario: Administrator creates a swimmer with a managed team assignment
- **WHEN** an administrator submits a valid swimmer profile with a selected team
  identifier from the managed team directory
- **THEN** the system stores the swimmer, persists the selected team association,
  and exposes the swimmer with structured team data in subsequent admin reads

#### Scenario: Administrator updates a swimmer team assignment
- **WHEN** an administrator edits an existing swimmer profile and selects a
  different managed team
- **THEN** the system persists the updated team association and later admin
  workflows expose the swimmer under the newly assigned team

#### Scenario: Administrator submits an unknown team assignment
- **WHEN** an administrator submits a swimmer create or update request with a
  team identifier that does not exist in the managed team directory
- **THEN** the system rejects the request and does not persist the swimmer change

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support public visibility controls and identity
display modes of real name, nickname, or admin-only hidden. Public-safe payloads
MUST use the configured display identity and MUST expose the swimmer's assigned
managed team when roster, detail, compare, or share workflows use team data to
distinguish children safely.

#### Scenario: Public page requests a hidden swimmer
- **WHEN** a swimmer is configured as not publicly visible
- **THEN** public listing and detail endpoints exclude that swimmer

#### Scenario: Public page requests a nickname-mode swimmer with a managed team
- **WHEN** a swimmer is public, configured for nickname display, and assigned to
  a managed team
- **THEN** public payloads expose the nickname as the swimmer display name and
  include the structured team data used to distinguish that swimmer
