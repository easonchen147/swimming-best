## Architecture Overview

本 change 只处理“官方基线 + 性别建模”，不处理自定义标准管理与 CSV 导入导出。

- Backend: Flask + SQLite + 只读资源文件
- Frontend: Next.js App Router + React 19 + Tailwind
- Data source: 用户提供的 `docs/男子达标.jpeg` 与 `docs/女子达标.jpeg`

---

## 1. Swimmer Gender Model

### Database

`swimmers` 表新增：

```sql
ALTER TABLE swimmers ADD COLUMN gender TEXT NOT NULL DEFAULT 'unknown';
```

取值固定为：

- `male`
- `female`
- `unknown`

选择这个枚举的原因：

- 与现有仓库字符串枚举风格一致
- 比 `M/F/X` 更清晰
- `unknown` 能兼容历史数据迁移

### Repository / API

`create_swimmer()` 与 `update_swimmer()` 接受 `gender` 字段；
`_row_to_swimmer()`、admin/public payload、TypeScript types 全部增加 `gender`。

当客户端未提交 `gender` 时，默认写入 `unknown`。

---

## 2. Official Grade Baseline Source Of Truth

### Storage Strategy

官方基线不进入管理员 CRUD，也不依赖业务数据库预置。实现时采用项目内只读资源：

```text
backend/swimming_best/resources/official_swimming_grade_standards.cn-2025.json
```

建议资源结构：

```json
{
  "specCode": "sport-2024-121",
  "specName": "游泳运动员技术等级标准",
  "effectiveDate": "2025-01-01",
  "sourceImages": [
    "docs/男子达标.jpeg",
    "docs/女子达标.jpeg"
  ],
  "tiers": [
    { "code": "level3", "label": "三级运动员", "order": 1 },
    { "code": "level2", "label": "二级运动员", "order": 2 },
    { "code": "level1", "label": "一级运动员", "order": 3 },
    { "code": "master", "label": "运动健将", "order": 4 },
    { "code": "international_master", "label": "国际级运动健将", "order": 5 }
  ],
  "entries": [
    {
      "gender": "male",
      "poolLengthM": 50,
      "distanceM": 50,
      "stroke": "freestyle",
      "tierCode": "level3",
      "timeMs": 32000
    }
  ]
}
```

### Matching Strategy

官方配置按以下维度匹配 event：

- `poolLengthM`
- `distanceM`
- `stroke`
- `gender`

不直接依赖 `eventId`，因为：

- 官方标准本质按规则维度定义，不按本地数据库 ID 定义
- 这样更稳定，也更适合后续 event 重建或重新导入

### Empty Cells

原图中没有值的项目不做推断。配置里直接缺省，对应查询结果返回：

- `officialGrade = null`
- `nextOfficialGrade = null`
- `officialGradeStatus = "unavailable_for_event"`

---

## 3. Official Grade Query Model

新增只读服务模块，建议实现职责：

- 加载并缓存官方 JSON 资源
- 根据 swimmer 的 `gender` 与 event 规则定位标准项
- 计算：
  - 当前已达到的最高官方等级
  - 下一等级与差距
  - 无法计算的状态原因

建议输出结构：

```json
{
  "officialGrade": {
    "code": "level2",
    "label": "二级运动员",
    "order": 2,
    "qualifyingTimeMs": 65000
  },
  "nextOfficialGrade": {
    "code": "level1",
    "label": "一级运动员",
    "order": 3,
    "qualifyingTimeMs": 55500,
    "gapMs": 1800
  },
  "officialGradeStatus": "ok"
}
```

状态值建议固定为：

- `ok`
- `missing_gender`
- `unavailable_for_event`
- `no_valid_performance`

---

## 4. API And UI Surface

### Public Analytics

扩展现有接口：

```text
GET /api/public/swimmers/:slug/events/:eventId/analytics
```

新增字段：

- `officialGrade`
- `nextOfficialGrade`
- `officialGradeStatus`

### Admin UI

`/admin/swimmers` 新增性别下拉：

- 男
- 女
- 未设置

### Public UI

首批只在详情页与项目分析页展示：

- 当前官方等级徽章
- 距下一等级还差多少

首页名单页暂不展示官方等级，避免目录页信息过载。

---

## 5. OpenSpec Boundary Alignment

本 change 只负责“官方只读基线”。

与 `myswimio-features` 的边界如下：

- 本 change：
  - `gender`
  - 官方标准资源
  - 官方等级查询
  - 官方等级展示
- `myswimio-features`：
  - 自定义标准组
  - benchmark lines
  - CSV 导入导出

因此 `myswimio-features` 中原先“预置国家标准”的表述必须移除。

---

## Risks / Trade-offs

1. **历史 swimmer 没有性别**
   - 处理：迁移后默认 `unknown`
   - 展示：提示“待补充性别后可计算官方等级”

2. **官方表与本地 event 定义不完全一致**
   - 处理：仅对能按池长/距离/泳姿精确映射的 event 计算

3. **官方标准后续更新**
   - 处理：通过版本化 JSON 文件替换，而不是后台改数
