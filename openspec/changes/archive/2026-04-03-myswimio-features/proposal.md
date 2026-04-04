## Why

Swimming Best 当前是一个基础的游泳成绩记录与展示工具，但存在两个关键短板：

1. **缺乏自定义时间标准体系**：除了官方达级外，教练仍需要按俱乐部训练目标、
   分组训练线、阶段目标线配置自定义 benchmark，当前系统还没有这层能力
2. **数据导入导出封闭**：无法批量导入历史成绩，也无法导出数据做外部分析或备份

本提案参考 MySwimIO 的核心产品能力，补齐“自定义 benchmark 管理”和
“CSV 导入导出”两项高价值能力。官方男子/女子达级基线改由独立 change
`official-swimming-grade-baseline` 负责。

## What Changes

### Phase 1：自定义时间标准体系（Custom Time Standards）
- 管理员可维护自定义标准组，例如“俱乐部 A 组线”“暑期集训线”“省赛报名线”
- 按性别范围、项目（泳姿+距离+池长）配置每个标准条目的达标时间
- 公开页面与分析页可叠加自定义 benchmark 线，但与官方达级基线分开展示
- 目标配置可基于自定义 benchmark 快速选取

### Phase 2：数据导入导出
- CSV 批量导入历史成绩（支持模板下载 + 格式校验 + 预览确认）
- CSV 导出选手成绩数据
- CSV 导出团队全量成绩数据

## Capabilities

### New Capabilities
- `custom-time-standards`: 管理员维护自定义 benchmark 标准组，按性别范围与项目配置达标时间
- `data-import-export`: CSV 批量导入（模板+校验+预览）+ 选手/团队成绩导出

### Modified Capabilities
- `progress-visualization`: 在现有 ImprovementChart 上叠加自定义 benchmark 水平参考线
- `goal-tracking`: 可基于自定义 benchmark 快速设定目标

### Removed Capabilities
- 无

## Open Questions

1. **标准组隔离**：是否需要支持“仅某个 team 可见”的标准组？当前提案先按全局标准组设计
2. **性别范围**：自定义 benchmark 是否允许“男女通用”条目？当前设计建议支持 `all`

## Out of Scope

- 官方男子/女子达级基线（由 `official-swimming-grade-baseline` 负责）
- 分段计时（Split Times）
- Power Index 综合评分
- 团队分析与排行
- 赛事场次管理
- 视频分析 / 可穿戴设备接入
- 训练计划 / 课表管理
- 移动端原生 App
