# Data Import/Export — 数据导入导出

## Summary
支持 CSV 批量导入历史成绩和导出选手/团队数据。导入支持模板下载、格式校验、预览确认；导出覆盖选手级别和团队级别。

## User Stories

1. **作为管理员**，我想下载 CSV 模板，填入历史成绩后上传批量导入，以避免逐条手动录入几百条历史数据。

2. **作为管理员**，我想在导入前看到解析预览，确认无误后再写入，以避免错误数据污染系统。

3. **作为管理员**，我想导出某个选手的全部成绩为 CSV，以便做外部分析或发给家长。

4. **作为管理员**，我想一键导出整个团队的成绩数据，以便生成训练报告或数据备份。

## Import

### 导入流程
```
下载模板 → 填写数据 → 上传 CSV → 服务端解析校验
→ 返回预览（valid + error 行）→ 用户确认
→ 服务端事务批量写入 → 返回导入摘要
```

### CSV 导入模板格式

```csv
swimmer_slug,event_display,performed_on,time_seconds,source_type,tags
alice,50m自由泳(25m池)-竞速,2024-03-15,35.11,competition,达标赛;春季
bob,100m蛙泳(50m池)-竞速,2024-03-15,78.45,training,
```

> 模板文件包含表头行 + 2行示例数据（示例行以 `#` 注释标记，导入时跳过）

### 字段定义

| 列名 | 必填 | 格式 | 说明 |
|------|------|------|------|
| `swimmer_slug` | ✅ | string | 选手的 URL slug，需匹配 `swimmers.slug` |
| `event_display` | ✅ | string | 项目显示名，需精确匹配 `events.display_name` |
| `performed_on` | ✅ | YYYY-MM-DD | 成绩日期 |
| `time_seconds` | ✅ | decimal | 总成绩秒数（如 `35.11` → 系统存为 `35110` ms）|
| `source_type` | ❌ | string | `training` / `test` / `competition` / `single`，默认 `single` |
| `tags` | ❌ | string | 标签名，多个以分号 `;` 分隔，不存在的标签自动创建 |

### 校验规则

1. `swimmer_slug` 必须匹配 `swimmers` 表中已存在的记录
2. `event_display` 必须匹配 `events` 表中已存在的 `display_name`
3. `time_seconds` 必须为正数（> 0）
4. `performed_on` 必须为合法 ISO 日期，不能晚于当天
5. `source_type` 若非空则必须为 `training` / `test` / `competition` / `single` 之一
6. 单次上传上限 **1000 行**，文件大小上限 **2MB**
7. 仅接受 `.csv` 文件，UTF-8 或 GBK 编码（自动检测）

### 导入写入逻辑

1. 按 `(source_type, performed_on)` 自动归组创建 `record_context`
   - title 自动生成：`"批量导入 - {date}"`
   - 同一 source_type + date 的行共享一个 context
2. 每行创建一条 `performance`，`result_status` 默认 `"valid"`
3. tags 自动查找或创建，写入 `performance_tags`
4. 整个导入过程包裹在一个 SQLite 事务中，任何行失败则整批回滚

## Export

### 选手成绩导出

**接口**: `GET /api/admin/export/swimmers/:id/performances.csv`

```csv
项目,日期,成绩(秒),来源类型,状态,标签
50m自由泳(25m池)-竞速,2024-03-15,35.110,competition,valid,达标赛;春季
100m蛙泳(50m池)-竞速,2024-03-20,78.450,training,valid,
200m蝶泳(50m池)-竞速,2024-04-01,156.780,test,valid,周测
```

字段来源映射：
- `项目` ← `events.display_name`
- `日期` ← `performances.performed_on`
- `成绩(秒)` ← `performances.time_ms / 1000`（保留 3 位小数）
- `来源类型` ← `record_contexts.source_type`
- `状态` ← `performances.result_status`
- `标签` ← `performance_tags` JOIN `tags`，分号连接

### 团队成绩导出

**接口**: `GET /api/admin/export/teams/:id/performances.csv`

```csv
选手slug,选手昵称,项目,日期,成绩(秒),来源类型,状态,是否PB
alice,小爱,50m自由泳(25m池)-竞速,2024-03-15,35.110,competition,valid,是
alice,小爱,50m自由泳(25m池)-竞速,2024-02-10,36.230,training,valid,
bob,小明,100m蛙泳(50m池)-竞速,2024-03-15,78.450,training,valid,是
```

额外字段：
- `选手slug` ← `swimmers.slug`
- `选手昵称` ← `swimmers.nickname`
- `是否PB` ← 该选手该项目所有 valid 成绩中的最佳时间则为"是"，否则为空

排序：选手slug ASC → 项目 ASC → 日期 ASC

## API Endpoints

### Admin
| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/admin/import/template` | 下载 CSV 导入模板 |
| POST | `/api/admin/import/preview` | 上传 CSV，返回校验预览（不写入） |
| POST | `/api/admin/import/confirm` | 确认导入，事务写入 |
| GET | `/api/admin/export/swimmers/:id/performances.csv` | 导出选手成绩 |
| GET | `/api/admin/export/teams/:id/performances.csv` | 导出团队成绩 |

### Preview 响应格式
```json
{
  "validRows": [
    { "line": 1, "swimmerSlug": "alice", "eventDisplay": "50m自由泳(25m池)-竞速", "performedOn": "2024-03-15", "timeSeconds": 35.11, "sourceType": "competition", "tags": ["达标赛", "春季"] }
  ],
  "errorRows": [
    { "line": 3, "raw": { "swimmer_slug": "unknown", "..." : "..." }, "errors": ["选手不存在: unknown"] }
  ],
  "summary": { "total": 50, "valid": 48, "errors": 2 }
}
```

### Confirm 响应格式
```json
{
  "imported": 48,
  "contextsCreated": 3,
  "performancesCreated": 48,
  "tagsCreated": 2
}
```

## UI Components

### ImportWizard
三步向导组件：

**Step 1 — 上传文件**
- 拖拽区域 + 点击选择
- 显示文件名、大小
- 模板下载链接
- 点击"解析预览"按钮提交

**Step 2 — 预览确认**
- 表格展示所有行
- 正确行：正常显示
- 错误行：红色背景 + 错误原因列
- 顶部摘要：总计 X 行，有效 Y 行，错误 Z 行
- 错误行将被跳过，仅导入有效行
- 点击"确认导入"按钮

**Step 3 — 导入结果**
- 成功摘要：导入 X 条成绩，创建 Y 个场次，新建 Z 个标签
- "返回成绩管理"链接

### ExportButton
通用下载按钮组件，点击触发 CSV 下载（通过 `window.location.href` 或 `fetch` + blob）。

放置位置：
- Admin 选手详情/列表 → "导出成绩"
- Admin 团队列表 → "导出团队成绩"

## Security & Edge Cases
- 导入/导出仅限已登录 Admin
- CSV 解析防注入：值以 `=`, `+`, `-`, `@` 开头时，前缀添加单引号
- 空文件或仅有表头的文件：返回友好提示"没有数据行"
- 重复数据：不做去重（同选手同项目同日期可以有多条成绩），与现有系统行为一致
- GBK 编码检测：先尝试 UTF-8，失败后 fallback 到 GBK
