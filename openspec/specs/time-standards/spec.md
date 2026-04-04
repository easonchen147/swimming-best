# Custom Time Standards — 自定义时间标准体系

## Summary
支持管理员维护自定义 benchmark 标准组，并按项目与性别范围配置达标时间。
这些标准用于训练线、报名线、分组线等业务场景，不替代官方男子/女子达级基线。

## Requirements

### Requirement: The system SHALL manage custom benchmark groups
The system SHALL allow administrators to create, update, list, and delete
custom benchmark groups and benchmark entries by event and gender scope.

#### Scenario: Administrator creates a benchmark entry
- **WHEN** an administrator creates a benchmark group and adds an event entry
- **THEN** the system stores the benchmark with its tier group, order, color,
  event, gender scope, and qualifying time

### Requirement: Analytics SHALL expose custom benchmark guidance
The system SHALL expose custom benchmarks separately from the official baseline
inside swimmer event analytics.

#### Scenario: Event analytics includes benchmark lines
- **WHEN** a swimmer event analytics payload is requested
- **THEN** the system returns `customStandards`, `nextCustomStandard`, and
  `benchmarkLines` for the matching swimmer gender scope
