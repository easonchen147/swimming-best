## MODIFIED Requirements

### Requirement: The system SHALL manage multiple swimmer profiles
The system SHALL allow administrators to create, update, list, and review
swimmer profiles for multiple children within one installation. Each swimmer
profile MUST reference one managed team entity, MUST persist a structured
`gender` value of `male`, `female`, or `unknown`, and MUST expose that value to
admin workflows that maintain swimmer metadata.

#### Scenario: Administrator creates a swimmer with a known gender
- **WHEN** an administrator submits a valid swimmer profile with a managed team
  assignment and an explicit gender selection
- **THEN** the system stores the swimmer, persists the selected gender, and
  exposes that gender in later admin reads

#### Scenario: Historical swimmer data is migrated without gender
- **WHEN** the application upgrades an older database that lacks the swimmer
  gender column
- **THEN** the system adds the gender column and backfills existing swimmers
  with `unknown`
