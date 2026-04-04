# Data Import/Export — 数据导入导出

## Summary
支持 CSV 批量导入历史成绩和导出选手/团队数据。导入支持模板下载、格式校验、
预览确认；导出覆盖选手级别和团队级别。

## Requirements

### Requirement: The system SHALL preview CSV imports before writing
The system SHALL let administrators upload a CSV file, validate each row,
return valid and invalid rows separately, and only write data after an
explicit confirm action.

#### Scenario: Preview contains valid and invalid rows
- **WHEN** an administrator uploads a CSV file with mixed-quality rows
- **THEN** the system returns a preview summary, valid rows, and error rows
  without writing anything to the database

### Requirement: The system SHALL support confirmed CSV import and CSV export
The system SHALL import validated rows transactionally and SHALL export swimmer-
level and team-level performance CSV files for downstream analysis.

#### Scenario: Administrator confirms an import
- **WHEN** an administrator confirms a validated preview payload
- **THEN** the system creates contexts, performances, and tags transactionally
  and returns an import summary

#### Scenario: Administrator exports team results
- **WHEN** an administrator requests a team CSV export
- **THEN** the system returns a CSV file containing swimmer identity, event,
  source type, result status, and PB marker fields
