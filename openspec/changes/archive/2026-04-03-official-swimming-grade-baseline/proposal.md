## Why

Swimming Best 当前没有对队员档案建模 `gender`，因此无法按官方男子/女子
达级标准判断成绩级别。现有公开页虽然已经展示 PB、目标和趋势，但“这个成绩
对应官方什么等级、距离下一等级还差多少”仍然缺位。

同时，用户已经提供了最新的男子/女子达标表图片，并明确要求把这套标准
**固化为项目内只读配置**，而不是放到后台手工维护或允许运行期直接编辑。

## What Changes

- 为 `swimmers` 增加正式 `gender` 字段，前后台统一透出
- 新增项目内只读官方达级配置，来源固定为：
  - `docs/男子达标.jpeg`
  - `docs/女子达标.jpeg`
- 以 `体竞字〔2024〕121号`、`2025-01-01` 生效版本作为该配置的版本基线
- 扩展公开 analytics 响应，返回：
  - 当前已达官方等级
  - 下一官方等级与差距
  - 无法计算时的状态原因
- 在队员详情页和项目详情页展示官方等级与距离下一等级的信息
- 在后台队员管理页新增性别录入与编辑

## Capabilities

### New Capabilities
- `official-grade-baseline`: 官方游泳达级基线，只读、版本化、项目内固化

### Modified Capabilities
- `swimmer-roster`: swimmer 增加 `gender`
- `progress-goals`: analytics 响应增加官方达级结果
- `public-performance-portal`: 公开详情页展示官方等级信息

### Removed Capabilities
- 无

## Out of Scope

- 后台直接编辑官方标准
- 把官方标准做成管理员 CRUD
- CSV 导入导出
- 教练自定义 benchmark 标准组
- 年龄组折算、积分化、综合评分
