## 1. Swimmer Gender Model

- [x] 1.1 在 `db.py` 为 `swimmers` 表新增 `gender` 字段，默认值为 `unknown`
- [x] 1.2 在启动迁移中兼容历史数据库，保证旧库升级后所有 swimmer 都有 `gender`
- [x] 1.3 在 `repository.py` 的 `create_swimmer()`、`update_swimmer()`、`_row_to_swimmer()` 中增加 `gender`
- [x] 1.4 更新 admin/public API payload 与前端 `types.ts`，统一透出 `gender`
- [x] 1.5 修改 Admin 孩子管理页，新增性别选择与编辑能力

## 2. Official Grade Baseline Resource

- [x] 2.1 新增只读资源文件 `backend/swimming_best/resources/official_swimming_grade_standards.cn-2025.json`
- [x] 2.2 依据 `docs/男子达标.jpeg` 与 `docs/女子达标.jpeg`，把全部官方达标项整理进该 JSON
- [x] 2.3 在 JSON 中写入版本元信息：`specCode`、`specName`、`effectiveDate`、`sourceImages`
- [x] 2.4 为原图中空白项目保留“无条目”语义，不推断、不补造数据

## 3. Backend Official Grade Query

- [x] 3.1 新增只读加载模块，负责读取并缓存官方基线 JSON
- [x] 3.2 实现 event 到官方配置项的匹配逻辑：按 `poolLengthM + distanceM + stroke + gender`
- [x] 3.3 实现官方等级查询：当前最高等级、下一等级、差距、状态码
- [x] 3.4 在 `services.py` 的 `event_analytics()` 中接入 `officialGrade`、`nextOfficialGrade`、`officialGradeStatus`

## 4. Public Presentation

- [x] 4.1 前端新增官方等级类型定义
- [x] 4.2 在孩子详情页展示当前官方等级与距离下一等级提示
- [x] 4.3 在项目详情页展示官方等级徽章和差距信息
- [x] 4.4 当 `gender=unknown` 或项目无官方标准时，展示明确但低干扰的降级提示

## 5. Testing

- [x] 5.1 编写后端测试：历史库 gender 迁移、官方 JSON 加载、等级匹配、状态码返回
- [x] 5.2 编写后端测试：`event_analytics()` 中 `officialGrade` / `nextOfficialGrade` 集成
- [x] 5.3 编写前端测试：孩子管理页性别字段、详情页官方等级展示、缺省状态提示
