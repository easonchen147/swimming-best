## REMOVED Requirements

### Requirement: The system SHALL manage custom benchmark groups
**Reason**: The default product workflow now relies on the built-in national
standard rather than administrator-maintained benchmark groups.
**Migration**: Legacy benchmark data may remain in storage for compatibility,
but the standard-management workflow is no longer part of the primary admin
experience.

### Requirement: Analytics SHALL expose custom benchmark guidance
**Reason**: Benchmark guidance is now expected to come from the built-in
official standard by default.
**Migration**: Public and admin analytics should surface the built-in official
baseline first; any legacy custom benchmark support becomes secondary and is
not exposed through the main navigation flow.
