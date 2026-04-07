## ADDED Requirements

### Requirement: Full-page profile export and focused arena detail SHALL remain responsive
The public swimmer full-page export composition and the focused arena detail
layout SHALL remain readable and stable on both desktop and phone-sized
viewports.

#### Scenario: Visitor uses the profile export on mobile
- **WHEN** a visitor loads a public swimmer detail page on a phone-sized viewport
- **THEN** the exportable long-image composition remains vertically complete and
  does not clip or collapse key sections

#### Scenario: Visitor opens the focused arena detail on mobile
- **WHEN** a visitor opens the arena page on a phone-sized viewport
- **THEN** the inline race-switching controls and the detailed ranking remain
  readable and tappable without requiring a second standalone switch panel
