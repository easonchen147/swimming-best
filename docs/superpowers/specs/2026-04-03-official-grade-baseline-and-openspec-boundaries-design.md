# Official Grade Baseline And OpenSpec Boundaries Design

**Problem**

当前项目已经具备公开成绩分析、PB 与目标展示能力，但有两个明显缺口：

1. `swimmers` 还没有正式的 `gender` 字段，系统无法按男子/女子标准判断达级。
2. 现有 `myswimio-features` 把“官方国标时间标准”和“自定义标准体系”混在一起，
   与“官方基线只读、项目内固化”的要求冲突。

此外，`swimming-public-ui-refactor` 已基本完成，README 里仍残留“多人对比”
描述，需要同步清理文档边界。

**Approved Direction**

- 采用 **B 方案**：
  - 新增独立 change：`official-swimming-grade-baseline`
  - 保留 `myswimio-features`，但收窄为“自定义标准 + CSV 导入导出”
  - `swimming-public-ui-refactor` 视为 archive-ready，后续按 OpenSpec 流程归档
- 官方达级基线是 **只读配置**，不是后台可编辑数据
- 官方达级数据来源固定为：
  - `docs/男子达标.jpeg`
  - `docs/女子达标.jpeg`
  - 对应口径按 `体竞字〔2024〕121号`、`2025-01-01` 生效版本执行

**Architecture**

- `swimmers` 新增 `gender` 字段，取值统一为：
  - `male`
  - `female`
  - `unknown`
- 官方达级基线不新增后台 CRUD，不存入可编辑业务表，运行时从项目内只读资源加载
- 推荐实现落点为：
  - `backend/swimming_best/resources/official_swimming_grade_standards.cn-2025.json`
- 官方基线按这些维度匹配：
  - `gender`
  - `poolLengthM`
  - `distanceM`
  - `stroke`
- analytics 接口新增官方达级字段：
  - `officialGrade`
  - `nextOfficialGrade`
  - `officialGradeStatus`
- 自定义标准体系保留在 `myswimio-features`，字段命名避免与官方基线重叠

**Boundary Decisions**

- `official-swimming-grade-baseline` 负责：
  - swimmer 性别建模
  - 官方男子/女子达级标准只读配置
  - 官方等级查询与公开展示
- `myswimio-features` 负责：
  - 自定义标准组
  - benchmark lines
  - CSV 导入导出
- `swimming-public-ui-refactor` 不再继续扩 scope，只做 archive 与文档清理

**Data Source Notes**

- 用户提供的两张 JPEG 是项目内直接证据，应作为录入官方配置时的主数据源
- 官方文号与生效日期用于版本标识和变更追溯
- 对应表格中的空值项，例如 `100米混合泳` 的 `50米池` 列，不补造数据；
  配置里直接缺省，查询时返回 `officialGradeStatus: unavailable_for_event`

**Verification Gates**

- OpenSpec proposal/design/tasks 的边界必须无重叠
- README 与现有前端能力描述必须一致，不再宣称公开 compare 是现行主能力
- 后续进入实现前，先完成：
  - 新 change 文档
  - 旧 change 收边
  - 设计自检
- 当前工作区不是 git 仓库，设计文档可落盘，但本轮无法提交 commit
