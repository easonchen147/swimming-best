# metadata-completion Specification

## Purpose
Clarify which existing schema fields are operator-facing and ensure those fields can be written through the admin experience.

## Requirements

### Requirement: Operator-facing schema metadata SHALL be writable through the admin experience
The system SHALL expose admin workflows for schema fields that materially affect operator behavior, public display, or analysis outcomes.

#### Scenario: Administrator edits swimmer profile metadata
- **WHEN** an administrator updates a swimmer's roster metadata that is meant to be operator-managed
- **THEN** the system persists that metadata and returns it through the admin API

#### Scenario: Administrator records context metadata
- **WHEN** an administrator creates a recording context with operator-facing metadata
- **THEN** the context stores that metadata instead of falling back to silent defaults

