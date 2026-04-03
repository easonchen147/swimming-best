## Architecture Overview

本提案涉及 2 个 Phase，遵循 Swimming Best 现有技术栈和架构模式：
- Backend: Flask 3.1 + SQLite (WAL) + Repository Pattern
- Frontend: Next.js (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Recharts
- 部署: uv + standalone output

---

## Phase 1: 时间标准体系

### 数据模型扩展

```sql
-- 标准等级定义（如：三级、二级、一级、运动健将、国际级运动健将）
CREATE TABLE IF NOT EXISTS time_standards (
    id          TEXT PRIMARY KEY,
    tier_group  TEXT NOT NULL DEFAULT '国家等级',  -- 标准组名
    name        TEXT NOT NULL,                     -- "三级运动员"
    tier_order  INTEGER NOT NULL,                  -- 1=最低(三级), 5=最高(国际健将)
    color_hex   TEXT NOT NULL DEFAULT '#6b7280',   -- 徽章颜色
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(tier_group, name)
);

-- 每个等级×项目×性别的达标时间
CREATE TABLE IF NOT EXISTS time_standard_entries (
    id                  TEXT PRIMARY KEY,
    standard_id         TEXT NOT NULL REFERENCES time_standards(id) ON DELETE CASCADE,
    event_id            TEXT NOT NULL REFERENCES events(id),
    gender              TEXT NOT NULL DEFAULT 'X',   -- M/F/X(不限)
    qualifying_time_ms  INTEGER NOT NULL,            -- 达标时间（毫秒）
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(standard_id, event_id, gender)
);

CREATE INDEX IF NOT EXISTS idx_std_entries_lookup
    ON time_standard_entries(event_id, gender, qualifying_time_ms);
```

swimmers 表已有 `birth_year` 字段，需新增 `gender` 字段：
```sql
ALTER TABLE swimmers ADD COLUMN gender TEXT NOT NULL DEFAULT 'X';
-- X = 未设置, M = 男, F = 女
```

### Backend 变更

**repository.py 新增方法：**
- `create_standard(payload)` / `list_standards()` / `update_standard(id, payload)` / `delete_standard(id)`
- `create_standard_entry(payload)` / `list_standard_entries(standard_id?, event_id?, gender?)` / `update_standard_entry(id, payload)` / `delete_standard_entry(id)`
- `get_achieved_standard(time_ms, event_id, gender)` → 返回当前 PB 达到的最高等级
- `get_next_standard(time_ms, event_id, gender)` → 返回最近的未达标等级及差距 ms
- `list_all_standards_for_event(event_id, gender)` → 返回该项目所有等级及是否达标

**services.py 变更：**
- `event_analytics()` 中调用标准查询，响应新增 `achievedStandard`、`nextStandard`、`allStandards`

**admin_routes.py 新增路由组：**
- `GET/POST /api/admin/standards`
- `PUT/DELETE /api/admin/standards/:id`
- `GET/POST /api/admin/standards/:id/entries`
- `PUT/DELETE /api/admin/standards/entries/:entryId`

### Frontend 变更

**新增类型 (types.ts)：**
```typescript
export type TimeStandard = {
  id: string;
  tierGroup: string;
  name: string;
  tierOrder: number;
  colorHex: string;
};

export type StandardEntry = {
  id: string;
  standardId: string;
  eventId: string;
  gender: string;
  qualifyingTimeMs: number;
};

export type AchievedStandard = {
  id: string;
  name: string;
  colorHex: string;
  tierOrder: number;
};

export type NextStandard = AchievedStandard & {
  qualifyingTimeMs: number;
  gapMs: number;
};

export type StandardForEvent = {
  name: string;
  colorHex: string;
  qualifyingTimeMs: number;
  achieved: boolean;
};
```

**新增组件：**
- `StandardBadge` — 等级徽章（颜色圆角标签 + 等级名）
- `StandardProgress` — 距下一等级进度条（当前时间 → 达标线，标注差距秒数）
- `StandardLinesOverlay` — ImprovementChart 上的达标线水平参考线

**新增页面：**
- `/admin/standards` — 标准等级管理页（CRUD 标准组、等级、达标条目）

**修改页面：**
- 选手详情页 / 项目详情页 — 新增达标面板区域
- Admin 选手编辑 — 新增性别字段
- ImprovementChart — 叠加达标线

---

## Phase 2: 数据导入导出

### CSV 导入格式

基于项目现有数据模型设计，字段直接对应系统中的实体：

```csv
swimmer_slug,event_display,performed_on,time_seconds,source_type,tags
alice,50m自由泳(25m池)-竞速,2024-03-15,35.11,competition,"达标赛;春季"
bob,100m蛙泳(50m池)-竞速,2024-03-15,78.45,training,
alice,200m蝶泳(50m池)-竞速,2024-03-20,156.78,test,"周测"
```

**字段说明：**

| 列名 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `swimmer_slug` | ✅ | string | 选手的 slug 标识，必须对应系统中已存在的选手 |
| `event_display` | ✅ | string | 项目显示名，必须与系统中 events 表的 `display_name` 精确匹配 |
| `performed_on` | ✅ | YYYY-MM-DD | 成绩日期 |
| `time_seconds` | ✅ | decimal | 总成绩（秒），如 35.11 → 系统自动转为 35110ms |
| `source_type` | ❌ | string | training / test / competition / single，默认 single |
| `tags` | ❌ | string | 标签，分号分隔，不存在的标签自动创建 |

**校验规则：**
- `swimmer_slug` 必须对应已存在的选手（查 swimmers 表）
- `event_display` 必须匹配已存在项目的 display_name（查 events 表）
- `time_seconds` 必须为正数
- `performed_on` 必须为合法日期且不超过今天
- `source_type` 如填写则必须为 training/test/competition/single 之一
- 单次导入上限 1000 行，文件大小上限 2MB
- 新建的 record_context 按 (source_type, performed_on) 自动归组

### CSV 导出格式

**选手成绩导出** (`GET /api/admin/export/swimmers/:id/performances.csv`)：

```csv
项目,日期,成绩(秒),来源类型,状态,标签
50m自由泳(25m池)-竞速,2024-03-15,35.110,competition,valid,"达标赛"
100m蛙泳(50m池)-竞速,2024-03-20,78.450,training,valid,
```

**团队成绩导出** (`GET /api/admin/export/teams/:id/performances.csv`)：

```csv
选手slug,选手昵称,项目,日期,成绩(秒),来源类型,状态,是否PB
alice,小爱,50m自由泳(25m池)-竞速,2024-03-15,35.110,competition,valid,是
alice,小爱,50m自由泳(25m池)-竞速,2024-02-10,36.230,training,valid,
bob,小明,100m蛙泳(50m池)-竞速,2024-03-15,78.450,training,valid,是
```

### Backend 变更

**新增模块 `import_export.py`：**
- `parse_csv(file_stream)` → 解析 CSV，返回原始行列表
- `validate_import_rows(rows, repo)` → 校验每行数据，返回 (valid_rows, error_rows)
- `execute_import(valid_rows, repo)` → 事务写入，自动创建 context + performances + tags
- `export_swimmer_csv(swimmer_id, repo)` → 生成选手成绩 CSV 内容
- `export_team_csv(team_id, repo)` → 生成团队成绩 CSV 内容
- `generate_template()` → 生成空白模板 CSV（含表头和 2 行示例）

**admin_routes.py 新增路由：**
- `GET /api/admin/import/template` — 下载 CSV 模板
- `POST /api/admin/import/preview` — 上传 CSV 返回预览（不写入）
- `POST /api/admin/import/confirm` — 确认导入
- `GET /api/admin/export/swimmers/:id/performances.csv` — 导出选手
- `GET /api/admin/export/teams/:id/performances.csv` — 导出团队

### Frontend 变更

**新增页面：**
- `/admin/import` — 导入向导（三步：上传 → 预览 → 结果）

**新增组件：**
- `ImportWizard` — 三步导入流程组件
- `ImportPreviewTable` — 预览表格，错误行红色高亮 + 错误原因
- `ExportButton` — 下载按钮

**修改页面：**
- Admin 选手管理 — 添加"导出 CSV"按钮
- Admin 团队管理 — 添加"导出 CSV"按钮

---

## Technical Constraints

1. SQLite 单文件数据库 — 批量导入使用事务，失败整批回滚
2. 新表通过 `db.py` 的 `_ensure_schema` 创建，兼容现有数据库
3. CSV 解析防注入：剔除 `=`, `+`, `-`, `@` 开头的可疑单元格值
4. 文件上传限制：仅 `.csv`，最大 2MB

## Dependencies

Phase 1（时间标准）和 Phase 2（导入导出）相互独立，可并行实施或按任意顺序。
