## Context

当前公开“对比”能力由 `frontend/src/app/compare/page.tsx` 和 `backend/swimming_best/services.py::compare` 组成，核心模型是“用户先选学员，再选项目，再看折线图”。这套模型对于低频比较是够用的，但它天然要求用户先知道目标学员，不适合做公开门户里的“发现型”能力。

你现在要的“竞技场”是另一种产品：用户进入后先扫描全局竞争格局，像看股票市场热力板一样浏览赛道，再选择某个赛道深入查看榜单。这个模型要求后端从“按用户请求比指定对象”转向“按赛道聚合公共竞争数据”。

## Goals / Non-Goals

**Goals:**
- 让公开竞技能力从两人对比工具升级为赛道市场板。
- 强制比较边界为同项目、同池长、同性别。
- 使用当前 shadcn/ui + Recharts 风格与主色调，保持与现有公开页面一致。
- 保留 `/compare` 兼容性，不让旧入口直接失效。

**Non-Goals:**
- 不做跨项目统一评分。
- 不做实时行情刷新。
- 不在本轮移除旧 compare backend 方法，允许兼容保留。
- 不引入新的视觉主题分支。

## Decisions

### 1. 主入口升级为竞技场，并保留 compare 兼容
**Decision**: 新增 `/arena` 作为主入口，公开页导航按钮文案改为“竞技场”；`/compare` 改为兼容跳转。
**Rationale**: 用户要升级的是产品语义，不只是页面内容。新路由可以让后续文档、分享链接和用户心智一致。
**Alternative considered**: 继续复用 `/compare` 作为唯一入口。被拒绝，因为它会长期保留错误的产品语义。

### 2. 竞技场主视图采用 Treemap 市场板
**Decision**: 使用 Recharts `Treemap` 作为主板块，tile 即赛道单元。
**Rationale**: Treemap 最接近“股票市场热力图”的扫视感，也能同时承载面积和颜色两个维度。
**Alternative considered**: CSS Grid 手写热力块。被拒绝，因为面积编码能力弱，且后续交互扩展性差。

### 3. 一个 tile 就是一个赛道，不再是一个学员
**Decision**: 每个热力单元代表 `(event_id, swimmer.gender)` 聚合后的赛道。
**Rationale**: `event_id` 已经天然区分长池/短池与项目本身，再叠加性别，刚好满足用户强调的比较边界。
**Alternative considered**: 直接把每位学员做成 tile。被拒绝，因为会重新掉回“跨项目乱比”的问题。

### 4. 热力图面积和颜色使用不同信号
**Decision**:
- 面积 = `competitorCount`
- 颜色 = `heatScore`
**Rationale**: 股票市场热图的可读性来自至少两个维度。面积体现赛道规模，颜色体现竞争热度，能同时回答“哪里人多”和“哪里最卷”。

### 5. unknown gender 不进入主竞技场
**Decision**: 性别未知的公开学员不纳入竞技场赛道聚合。
**Rationale**: 用户明确要求男女必须分开；把 unknown 混入任一赛道都会破坏边界。

## Risks / Trade-offs

- [Risk] 热度分数可能被用户质疑“怎么算的” -> Mitigation: 在详情面板里给出简洁解释，使用相对指标而非绝对秒数。
- [Risk] 移动端 Treemap 标签拥挤 -> Mitigation: 减少 tile 内文字密度，详情面板承接更多信息。
- [Risk] compare 旧测试和路由假设失效 -> Mitigation: 保留 `/compare` 兼容跳转并更新测试到新语义。
