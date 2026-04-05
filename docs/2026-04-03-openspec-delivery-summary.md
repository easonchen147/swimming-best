# 2026-04-03 OpenSpec Delivery Summary

## Scope

本轮交付覆盖 3 个 OpenSpec change：

- `official-swimming-grade-baseline`
- `myswimio-features`
- `swimming-public-ui-refactor`

最终状态：

- 三个 change 均已完成实现
- 三个 change 均已归档到 `openspec/changes/archive/2026-04-03-*`
- `openspec list --json` 当前返回空列表，表示无活动 change

## Implemented Features

### 1. Official Grade Baseline

- 为 swimmer 正式增加 `gender` 字段：`male / female / unknown`
- 将男子/女子官方达标表固化为只读资源：
  - `backend/swimming_best/resources/official_swimming_grade_standards.cn-2025.json`
- 在公开 analytics 中新增：
  - `officialGrade`
  - `nextOfficialGrade`
  - `officialGradeStatus`
- 在公开详情页与项目页展示官方达级信息

### 2. Custom Time Standards

- 新增 `time_standards` / `time_standard_entries`
- 新增后台标准管理接口与页面：
  - `/api/admin/standards`
  - `/admin/standards`
- 在公开 analytics 中新增：
  - `customStandards`
  - `nextCustomStandard`
  - `benchmarkLines`
- 改进图表，支持 benchmark 参考线

### 3. CSV Import / Export

- 新增导入预览与确认接口：
  - `GET /api/admin/import/template`
  - `POST /api/admin/import/preview`
  - `POST /api/admin/import/confirm`
- 新增导出接口：
  - `GET /api/admin/export/swimmers/:id/performances.csv`
  - `GET /api/admin/export/teams/:id/performances.csv`
- 新增后台导入页：
  - `/admin/import`
- 在后台队员页和队伍页补充 CSV 导出入口

## Environment Cleanup

本轮还顺手处理了工程环境噪音：

- npm 源固定为 `http://registry.npmmirror.com/`
  - `/.npmrc`
  - `/frontend/.npmrc`
- `frontend/next.config.ts` 增加 `turbopack.root`
  用于消除 Next workspace root 推断告警
- `backend/pyproject.toml`：
  - 关闭 `pytest` cache provider
  - 为 `ruff` 增加临时目录排除
- 根 `package.json` 的 backend 校验脚本切到更稳定的 `uv` 执行方式
- `.gitignore` 补齐 `.npm-cache/`、`.uv-cache*/`、`.pytest-local/` 等临时目录

## Verification Evidence

本轮最终验证命令与结果：

### Backend

```bash
uv run --with pytest python -m pytest tests -q
```

结果：

- `23 passed`

```bash
uv run --with ruff ruff check swimming_best tests
```

结果：

- `All checks passed!`

### Frontend

```bash
npm run lint
```

结果：

- 通过

```bash
npm run test
```

结果：

- `12 passed` test files
- `21 passed` tests

```bash
npm run build
```

结果：

- 通过

## Archive Result

归档目录：

- `openspec/changes/archive/2026-04-03-official-swimming-grade-baseline`
- `openspec/changes/archive/2026-04-03-myswimio-features`
- `openspec/changes/archive/2026-04-03-swimming-public-ui-refactor`

归档后命令：

```bash
openspec list --json
```

结果：

```json
{"changes":[]}
```
