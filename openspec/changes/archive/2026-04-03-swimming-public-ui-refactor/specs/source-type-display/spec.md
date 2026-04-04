## ADDED Requirements

### Requirement: Public timeline SHALL display performance source type
The public-facing performance timeline and analytics views SHALL display the source type (训练/测试/比赛/临时记录) for each performance record. The source type MUST be fetched from the associated `record_context` and included in the analytics API response.

#### Scenario: Public analytics response includes source type
- **WHEN** a visitor requests event analytics for a swimmer
- **THEN** each raw performance data point in the response SHALL include a `sourceType` field from the associated record context

#### Scenario: Source type is displayed in public timeline
- **WHEN** a visitor views a swimmer's event performance timeline
- **THEN** each timeline entry SHALL display a badge indicating the source type (训练/测试/比赛/临时记录) alongside the date and time value

#### Scenario: Source type badge uses distinct visual styling
- **WHEN** a performance entry is rendered in the public timeline
- **THEN** the source type badge SHALL use visually distinct colors per type: 比赛 (competition) is highlighted, 训练 (training) is neutral, 测试 (test) is muted, 临时记录 (single) is minimal
