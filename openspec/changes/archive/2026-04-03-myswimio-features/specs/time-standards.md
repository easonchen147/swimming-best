# Custom Time Standards — 自定义时间标准体系

## Summary
支持管理员维护自定义 benchmark 标准组，并按项目与性别范围配置达标时间。
这些标准用于训练线、报名线、分组线等业务场景，不替代官方男子/女子达级基线。

## User Stories

1. **作为管理员**，我想管理自定义 benchmark 标准组，并为每个标准条目配置项目与性别范围，以便公开页面叠加训练线和报名线。

2. **作为访问者**，我想在选手的成绩分析里看到俱乐部 benchmark 线，以便了解成绩是否达到当前训练目标。

3. **作为访问者**，我想看到距离下一条自定义 benchmark 还差多少，以便明确训练方向。

## Data Model

```sql
CREATE TABLE IF NOT EXISTS time_standards (
    id          TEXT PRIMARY KEY,
    tier_group  TEXT NOT NULL,
    name        TEXT NOT NULL,
    tier_order  INTEGER NOT NULL,
    color_hex   TEXT NOT NULL DEFAULT '#6b7280',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(tier_group, name)
);

CREATE TABLE IF NOT EXISTS time_standard_entries (
    id                  TEXT PRIMARY KEY,
    standard_id         TEXT NOT NULL REFERENCES time_standards(id) ON DELETE CASCADE,
    event_id            TEXT NOT NULL REFERENCES events(id),
    gender              TEXT NOT NULL DEFAULT 'all',  -- male/female/all
    qualifying_time_ms  INTEGER NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(standard_id, event_id, gender)
);

CREATE INDEX IF NOT EXISTS idx_std_entries_lookup
    ON time_standard_entries(event_id, gender, qualifying_time_ms);
```

> swimmer 的 `gender` 字段由 `official-swimming-grade-baseline` 提供。
> 本能力只消费该字段，不负责定义官方基线。

## API Endpoints

### Admin
- `GET /api/admin/standards` — 列出所有标准等级
- `POST /api/admin/standards` — 创建标准等级
- `PATCH /api/admin/standards/:id` — 编辑标准等级
- `DELETE /api/admin/standards/:id` — 删除（级联删除条目）
- `GET /api/admin/standards/:id/entries` — 列出某等级的达标条目
- `POST /api/admin/standards/:id/entries` — 添加达标条目
- `PATCH /api/admin/standards/entries/:entryId` — 编辑达标条目
- `DELETE /api/admin/standards/entries/:entryId` — 删除达标条目

### Public（扩展现有 analytics 接口）
`GET /api/public/swimmers/:slug/events/:eventId/analytics` 响应新增：
```json
{
  "nextCustomStandard": {
    "name": "A组达标",
    "colorHex": "#22c55e",
    "tierOrder": 2
  },
  "customStandards": [
    {
      "name": "启蒙达标",
      "tierGroup": "暑期集训线",
      "colorHex": "#94a3b8",
      "qualifyingTimeMs": 30000,
      "achieved": true
    },
    {
      "name": "A组达标",
      "tierGroup": "暑期集训线",
      "colorHex": "#3b82f6",
      "qualifyingTimeMs": 27500,
      "achieved": false
    }
  ],
  "benchmarkLines": [
    {
      "name": "启蒙达标",
      "tierGroup": "暑期集训线",
      "colorHex": "#94a3b8",
      "qualifyingTimeMs": 30000
    },
    {
      "name": "A组达标",
      "tierGroup": "暑期集训线",
      "colorHex": "#3b82f6",
      "qualifyingTimeMs": 27500
    }
  ]
}
```

## UI Components

### StandardBadge
小型内联徽章：`<span>` 圆角标签，背景色=colorHex，文字=标准名。

### StandardProgress
进度条组件：
- 显示当前 PB → 下一条自定义 benchmark
- 标注"还差 X.XX 秒"
- 如果已经达到当前组最高标准，显示"已达到本组最高线"

### StandardLinesOverlay
在 ImprovementChart 上叠加水平虚线 + 标签，标注各 benchmark 线位置。

### Admin: StandardsManager 页面
- 左侧：标准等级列表卡片，支持增删改（名称、排序、颜色）
- 右侧：选中等级后，按项目展示达标条目表格
  - 行：每个 event（按 displayName 排序）
  - 列：男子适用 | 女子适用 | 通用
  - 支持内联编辑（TimeInput 组件复用）

## Edge Cases
- 选手 `gender=unknown` 时，仅匹配 `gender='all'` 的条目
- 某个项目没有配置任何自定义条目时，静默不显示
- 选手 PB 快于当前组最高线时，显示最高 benchmark 标签 + "已达到本组最高线"
- 多个标准组共存时，在 UI 上按 `tierGroup` 分组展示
