## ADDED Requirements

### Requirement: Public swimmer detail pages SHALL export a full-page growth image
The public swimmer detail page SHALL provide a user-facing action that exports
the current growth profile as one full-page long image, and that action MUST
not depend on the previous poster-save behavior.

#### Scenario: Visitor downloads the full-page growth image
- **WHEN** a visitor clicks the profile export action after analytics have loaded
- **THEN** the system generates and downloads one long image that represents the
  full visible growth profile content for the selected event

### Requirement: Public swimmer detail pages SHALL retire the old poster-save action
The public swimmer detail page MUST NOT continue exposing the old
“保存分享海报” behavior once the full-page export flow replaces it.

#### Scenario: Visitor opens a swimmer detail page
- **WHEN** the public swimmer detail page is rendered
- **THEN** the page exposes only the new full-page export action and no longer
  presents the legacy poster-save wording or flow
