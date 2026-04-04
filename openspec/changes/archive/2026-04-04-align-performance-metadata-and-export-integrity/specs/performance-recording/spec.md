## MODIFIED Requirements

### Requirement: The system SHALL preserve result status, notes, and tags
Each performance record SHALL support result status, public/admin notes, and optional tags or inherited context tags so that records can be filtered and explained later, and operator-facing context metadata SHALL be writable from the admin recording flows.

#### Scenario: Administrator records context details
- **WHEN** an administrator creates a context with supported metadata such as location or notes
- **THEN** the stored context preserves that metadata and exposes it through the admin API

