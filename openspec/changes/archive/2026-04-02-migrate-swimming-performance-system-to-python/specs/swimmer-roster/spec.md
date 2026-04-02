## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review swimmer profiles for multiple children within one installation. Each swimmer profile MUST include an optional team/group field that can be used to distinguish children across admin and public workflows.

#### Scenario: Administrator creates a swimmer with a team/group
- **WHEN** an administrator submits a valid swimmer profile including a team/group value such as `A`, `B`, or `C`
- **THEN** the system stores the swimmer, persists the team/group value, and makes it available to admin workflows

#### Scenario: Administrator updates a swimmer team/group
- **WHEN** an administrator edits an existing swimmer profile and changes the swimmer's team/group
- **THEN** the system persists the updated team/group and exposes the new value in subsequent admin reads

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support public visibility controls and identity display modes of real name, nickname, or admin-only hidden. Public-safe payloads MUST use the configured display identity and MAY include the swimmer's team/group when that information is allowed for public distinction.

#### Scenario: Public page requests a hidden swimmer
- **WHEN** a swimmer is configured as not publicly visible
- **THEN** public listing and detail endpoints exclude that swimmer

#### Scenario: Public page requests a nickname-mode swimmer with a team/group
- **WHEN** a swimmer is public, configured for nickname display, and has a team/group value
- **THEN** public payloads expose the nickname as the swimmer display name and include the team/group where the page uses it to distinguish swimmers
