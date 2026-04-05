# Swimming Best Agent Notes

## Project Snapshot

`Swimming Best` 是一个少儿游泳成绩管理系统，当前主干是：

- 前端：Next.js 16 + React 19 + Tailwind CSS 4
- 后端：Python 3.12 + Flask + SQLite
- 文档：README、docs、OpenSpec

功能已经覆盖：

- 管理员登录
- 队伍管理
- 队员档案管理
- 结构化项目管理
- 成绩录入与上下文记录
- PB / 趋势 / 目标进度
- 官方达级标准
- 自定义达标线
- CSV 导入导出
- 公开展示与分享页

## Current Repo Layout

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── frontend/
├── backend/
├── scripts/
├── docs/
└── openspec/
```

## Backend Structure

关键文件：

- `backend/swimming_best/app.py`
- `backend/swimming_best/config.py`
- `backend/swimming_best/db.py`
- `backend/swimming_best/auth.py`
- `backend/swimming_best/repository.py`
- `backend/swimming_best/services.py`
- `backend/swimming_best/admin_routes.py`
- `backend/swimming_best/public_routes.py`
- `backend/swimming_best/import_export.py`
- `backend/swimming_best/official_grade_baseline.py`

仓库层非常重，很多业务逻辑直接集中在 `repository.py`，后续 review 和改动时必须优先看它。

## Frontend Structure

关键区域：

- `frontend/src/app/page.tsx`
- `frontend/src/app/compare/page.tsx`
- `frontend/src/app/swimmers/[slug]/**`
- `frontend/src/app/admin/**`
- `frontend/src/components/charts/**`
- `frontend/src/components/shared/**`
- `frontend/src/lib/api/**`
- `frontend/src/lib/types.ts`

## Package Manager Strategy

后端当前已经整理成“`uv + Poetry` 共用一份依赖声明”的模式。

### Source of Truth

- `backend/pyproject.toml`
  - 主依赖走 `[project.dependencies]`
  - 开发依赖走 `[dependency-groups]`
- `backend/poetry.lock`
  - Poetry 锁文件
- `backend/uv.lock`
  - uv 锁文件
- `backend/poetry.toml`
  - 固定 `Poetry` 使用项目内 `.venv`

### Roles

- `Poetry`
  - 负责稳定锁定
  - 负责精确同步完整开发环境
- `uv`
  - 负责快速同步
  - 负责快速运行测试、lint、服务

### Recommended Commands

首次进入项目或依赖变更后：

```bash
cd backend
poetry sync --with dev
uv sync
```

日常开发：

```bash
cd backend
uv run python -m swimming_best
uv run python -m pytest tests -q
uv run ruff check swimming_best tests
```

修改依赖后：

```bash
cd backend
poetry lock
uv lock
poetry sync --with dev
uv sync --locked
```

### Important Note

当前仓库保留了腾讯源配置，原因是主要工作环境在国内。
如果某台机器需要其他镜像，优先通过本地配置覆盖；不要在没有理由的情况下删除现有国内源配置。

## Root Scripts

根目录 `package.json` 里当前最重要的脚本：

```bash
npm run frontend:dev
npm run frontend:lint
npm run frontend:test
npm run frontend:build

npm run backend:install
npm run backend:sync:uv
npm run backend:lock:poetry
npm run backend:lock:uv
npm run backend:run
npm run backend:run:uv
npm run backend:lint
npm run backend:test

npm run check
```

## Config And Runtime

- 运行时配置文件：`backend/config.toml`
- 示例文件：`backend/config.example.toml`
- 数据库：SQLite
- 数据目录和 `config.toml` 都不应提交到 Git

## OpenSpec

当前仓库已经经历多轮 OpenSpec 迭代，重要主题包括：

- `build-swimming-performance-system`
- `migrate-swimming-performance-system-to-python`
- `rework-managed-team-entities`
- `official-swimming-grade-baseline`
- `swimming-public-ui-refactor`
- `comprehensive-uiux-upgrade`
- `myswimio-features`

如果修改产品行为、数据模型或部署方式，优先检查对应 spec 是否也要同步。

## Verified Baseline

截至 2026-04-04，这些后端链路已经验证通过：

- `poetry check --lock`
- `poetry sync --with dev`
- `poetry run python -m pytest tests -q`
- `uv sync --locked`
- `uv run python -m pytest tests -q`
- `uv run ruff check swimming_best tests`

## Known Review Risks

当前仍需优先关注：

- 前端测试套件不是全绿
- 前端生产构建存在类型问题
- 部分 UI 文件出现中文乱码
- 部分表单 label 与控件关联不正确，影响 a11y 和测试可靠性

继续开发前，优先把这些基础问题清掉。
