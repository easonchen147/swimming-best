## Why

Swimming Best 当前是一个基础的游泳成绩记录与展示工具，但存在两个关键短板：

1. **缺乏时间标准体系**：没有达标线/等级标准概念，教练和家长无法直观了解队员成绩处于什么水平，距离下一个等级还差多少
2. **数据导入导出封闭**：无法批量导入历史成绩，也无法导出数据做外部分析或备份

本提案参考 MySwimIO 的核心产品能力，优先补齐这两项最有价值的功能。

## What Changes

### Phase 1：时间标准体系（Time Standards）
- 内置国家游泳运动员技术等级标准（国际级运动健将/运动健将/一级/二级/三级），同时支持管理员自定义标准
- 按性别、项目（泳姿+距离+池长）配置每个等级的达标时间
- 公开页面在成绩旁显示当前达到的最高等级徽章
- 选手详情页新增"达标进度"面板：展示各项目距离下一等级还差多少

### Phase 2：数据导入导出
- CSV 批量导入历史成绩（支持模板下载 + 格式校验 + 预览确认）
- CSV 导出选手成绩数据
- CSV 导出团队全量成绩数据

## Capabilities

### New Capabilities
- `time-standards`: 国家游泳运动员技术等级标准 + 自定义标准体系，按性别、项目配置达标时间，公开页面徽章展示
- `data-import-export`: CSV 批量导入（模板+校验+预览）+ 选手/团队成绩导出

### Modified Capabilities
- `progress-visualization`: 在现有 ImprovementChart 上叠加达标线水平参考线
- `goal-tracking`: 可基于等级标准快速设定目标

### Removed Capabilities
（无）

## Open Questions

1. **国家标准数据**：需要手动录入国家游泳运动员技术等级标准的达标时间数据，后续版本可考虑预置
2. **年龄组**：国家标准是否按年龄分组？当前 swimmers 表已有 birth_year 字段可支持

## Out of Scope

- 分段计时（Split Times）
- Power Index 综合评分
- 团队分析与排行
- 赛事场次管理
- 视频分析 / 可穿戴设备接入
- 训练计划 / 课表管理
- 移动端原生 App
