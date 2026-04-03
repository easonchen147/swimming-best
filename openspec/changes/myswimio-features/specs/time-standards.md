# Time Standards — 时间标准体系

## Summary
内置国家游泳运动员技术等级标准（三级/二级/一级/运动健将/国际级运动健将），同时支持管理员自定义标准。公开页面自动展示达标等级徽章和距下一等级的差距。

## User Stories

1. **作为管理员**，我想管理时间标准等级（预置国家等级 + 可自定义），并为每个等级配置各项目各性别的达标时间，以便公开页面自动展示达标情况。

2. **作为访问者**，我想在选手的成绩旁看到等级徽章（如「二级」「一级」），以便快速了解这个成绩处于什么水平。

3. **作为访问者**，我想在选手详情页看到"距离下一等级还差 X 秒"的进度指示，以便了解进步方向。

## Data Model

```sql
CREATE TABLE IF NOT EXISTS time_standards (
    id          TEXT PRIMARY KEY,
    tier_group  TEXT NOT NULL DEFAULT '国家等级',
    name        TEXT NOT NULL,
    tier_order  INTEGER NOT NULL,       -- 1=三级, 2=二级, 3=一级, 4=运动健将, 5=国际级运动健将
    color_hex   TEXT NOT NULL DEFAULT '#6b7280',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(tier_group, name)
);

CREATE TABLE IF NOT EXISTS time_standard_entries (
    id                  TEXT PRIMARY KEY,
    standard_id         TEXT NOT NULL REFERENCES time_standards(id) ON DELETE CASCADE,
    event_id            TEXT NOT NULL REFERENCES events(id),
    gender              TEXT NOT NULL DEFAULT 'X',  -- M/F/X
    qualifying_time_ms  INTEGER NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(standard_id, event_id, gender)
);

CREATE INDEX IF NOT EXISTS idx_std_entries_lookup
    ON time_standard_entries(event_id, gender, qualifying_time_ms);
```

swimmers 表新增字段：
```sql
ALTER TABLE swimmers ADD COLUMN gender TEXT NOT NULL DEFAULT 'X';
```

## 预置等级（国家游泳运动员技术等级标准）

| tier_order | name | color_hex | 说明 |
|------------|------|-----------|------|
| 1 | 三级运动员 | `#94a3b8` (slate) | 入门级 |
| 2 | 二级运动员 | `#22c55e` (green) | 业余较好水平 |
| 3 | 一级运动员 | `#3b82f6` (blue) | 专业入门 |
| 4 | 运动健将 | `#f59e0b` (amber) | 专业水平 |
| 5 | 国际级运动健将 | `#ef4444` (red) | 国际水平 |

> 达标时间数据需管理员通过 Admin 页面手动录入（后续版本可考虑预置数据包）。

## API Endpoints

### Admin
- `GET /api/admin/standards` — 列出所有标准等级
- `POST /api/admin/standards` — 创建标准等级
- `PUT /api/admin/standards/:id` — 编辑标准等级
- `DELETE /api/admin/standards/:id` — 删除（级联删除条目）
- `GET /api/admin/standards/:id/entries` — 列出某等级的达标条目
- `POST /api/admin/standards/:id/entries` — 添加达标条目
- `PUT /api/admin/standards/entries/:entryId` — 编辑达标条目
- `DELETE /api/admin/standards/entries/:entryId` — 删除达标条目

### Public（扩展现有 analytics 接口）
`GET /api/public/swimmers/:slug/events/:eventId/analytics` 响应新增：
```json
{
  "achievedStandard": {
    "name": "二级运动员",
    "colorHex": "#22c55e",
    "tierOrder": 2
  },
  "nextStandard": {
    "name": "一级运动员",
    "colorHex": "#3b82f6",
    "tierOrder": 3,
    "qualifyingTimeMs": 25000,
    "gapMs": 1200
  },
  "allStandards": [
    { "name": "三级运动员", "colorHex": "#94a3b8", "qualifyingTimeMs": 30000, "achieved": true },
    { "name": "二级运动员", "colorHex": "#22c55e", "qualifyingTimeMs": 27500, "achieved": true },
    { "name": "一级运动员", "colorHex": "#3b82f6", "qualifyingTimeMs": 25000, "achieved": false },
    { "name": "运动健将", "colorHex": "#f59e0b", "qualifyingTimeMs": 23500, "achieved": false },
    { "name": "国际级运动健将", "colorHex": "#ef4444", "qualifyingTimeMs": 22500, "achieved": false }
  ]
}
```

## UI Components

### StandardBadge
小型内联徽章：`<span>` 圆角标签，背景色=colorHex，文字=等级名。用于 Timeline 成绩条目、PB 指标卡片旁。

### StandardProgress
进度条组件：
- 显示当前 PB → 下一等级达标线
- 标注"还差 X.XX 秒"
- 如果已达最高等级，显示"已超越最高标准"

### StandardLinesOverlay
在 ImprovementChart 上叠加水平虚线 + 标签，标注各等级达标时间位置，让选手直观看到成绩与各等级的距离。

### Admin: StandardsManager 页面
- 左侧：标准等级列表卡片，支持增删改（名称、排序、颜色）
- 右侧：选中等级后，按项目展示达标条目表格
  - 行：每个 event（按 displayName 排序）
  - 列：男子达标时间 | 女子达标时间 | 不限性别达标时间
  - 支持内联编辑（TimeInput 组件复用）

## Edge Cases
- 选手未设置性别时，查询使用 gender='X' 的条目；若无 X 条目则不显示
- 某个项目没有配置任何标准条目时，静默不显示徽章（降级）
- 选手 PB 快于最高等级时，显示最高等级徽章 + "已超越最高标准"
- 多个标准组共存时（如国家等级 + 自定义俱乐部等级），在 UI 上分组展示
