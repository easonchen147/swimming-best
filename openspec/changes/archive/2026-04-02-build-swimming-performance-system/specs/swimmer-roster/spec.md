## ADDED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review swimmer profiles for multiple children within one installation.

#### Scenario: Administrator creates a swimmer
- **WHEN** an administrator submits a valid swimmer profile
- **THEN** the system stores the swimmer and makes it available to admin workflows

#### Scenario: Administrator updates a swimmer
- **WHEN** an administrator edits an existing swimmer profile
- **THEN** the system persists the updated swimmer fields

### Requirement: Swimmer profiles SHALL control public identity and visibility
Each swimmer profile SHALL support public visibility controls and identity display modes of real name, nickname, or admin-only hidden.

#### Scenario: Public page requests a hidden swimmer
- **WHEN** a swimmer is configured as not publicly visible
- **THEN** public listing and detail endpoints exclude that swimmer

#### Scenario: Public page requests a nickname-mode swimmer
- **WHEN** a swimmer is public and configured for nickname display
- **THEN** public payloads expose the nickname as the swimmer display name and do not expose the real name

