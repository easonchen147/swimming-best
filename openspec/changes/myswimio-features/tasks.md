## Phase 1: 时间标准体系（Time Standards）

- [ ] 1.1 在 `db.py` 新增 `time_standards` 和 `time_standard_entries` 建表语句
- [ ] 1.2 在 `db.py` 为 `swimmers` 表新增 `gender` 字段（TEXT, default 'X'）
- [ ] 1.3 在 `repository.py` 实现标准 CRUD：`create_standard()`, `list_standards()`, `update_standard()`, `delete_standard()`
- [ ] 1.4 在 `repository.py` 实现达标条目 CRUD：`create_standard_entry()`, `list_standard_entries()`, `update_standard_entry()`, `delete_standard_entry()`
- [ ] 1.5 在 `repository.py` 实现达标查询：`get_achieved_standard(time_ms, event_id, gender)`, `get_next_standard(time_ms, event_id, gender)`, `list_all_standards_for_event(event_id, gender)`
- [ ] 1.6 在 `services.py` 的 `event_analytics()` 中集成标准查询，响应新增 `achievedStandard`, `nextStandard`, `allStandards`
- [ ] 1.7 在 `admin_routes.py` 新增标准管理路由组 `/api/admin/standards`（CRUD 标准 + 条目）
- [ ] 1.8 前端 `types.ts` 新增 `TimeStandard`, `StandardEntry`, `AchievedStandard`, `NextStandard`, `StandardForEvent` 类型
- [ ] 1.9 前端新增 API client 方法：标准 CRUD + 条目 CRUD
- [ ] 1.10 前端新增 Admin 页面 `/admin/standards` — 标准等级管理界面（等级列表 + 达标条目表格）
- [ ] 1.11 前端新增 `StandardBadge` 组件 — 等级徽章
- [ ] 1.12 前端新增 `StandardProgress` 组件 — 距下一等级进度条
- [ ] 1.13 前端修改 `ImprovementChart` — 叠加达标线水平参考线
- [ ] 1.14 前端修改选手详情页和项目详情页 — 显示达标徽章和进度
- [ ] 1.15 前端修改 Admin 选手编辑 — 新增性别字段
- [ ] 1.16 编写后端测试：标准 CRUD、达标查询逻辑、analytics 集成
- [ ] 1.17 编写前端测试：StandardBadge 渲染、StandardProgress 计算

## Phase 2: 数据导入导出

- [ ] 2.1 后端新增 `import_export.py` 模块：`parse_csv()`, `validate_import_rows()`, `execute_import()`, `export_swimmer_csv()`, `export_team_csv()`, `generate_template()`
- [ ] 2.2 实现 CSV 模板下载 API `GET /api/admin/import/template`
- [ ] 2.3 实现 CSV 预览 API `POST /api/admin/import/preview`（解析 + 校验 + 返回预览，不写入）
- [ ] 2.4 实现 CSV 确认导入 API `POST /api/admin/import/confirm`（事务批量写入，自动创建 context + performances + tags）
- [ ] 2.5 实现选手成绩导出 API `GET /api/admin/export/swimmers/:id/performances.csv`
- [ ] 2.6 实现团队成绩导出 API `GET /api/admin/export/teams/:id/performances.csv`
- [ ] 2.7 前端新增 Admin 页面 `/admin/import` — 导入向导（上传 → 预览 → 结果三步）
- [ ] 2.8 前端在 Admin 选手/团队页面添加"导出 CSV"按钮
- [ ] 2.9 编写后端测试：CSV 解析、校验规则（slug不存在/项目不匹配/日期非法/source_type非法）、导入事务、导出格式
- [ ] 2.10 编写前端测试：ImportWizard 步骤流转
