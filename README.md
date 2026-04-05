# Swimming Best

`Swimming Best` 是一个面向少儿游泳训练场景的成绩管理系统。
它把零散的成绩录入、PB 识别、趋势回看、目标跟踪、公开展示和分享，
收敛到一套同时适配桌面端后台与移动端公开页面的产品中。

项目当前采用前后端分离架构：

- `frontend/`：Next.js 16 + React 19 + Tailwind CSS 4 前端
- `backend/`：Python 3.12 + Flask + SQLite 后端
- `docs/`：设计文档、实现计划与部署说明
- `openspec/`：基线规格与归档变更

## 项目亮点

- 管理员后台可维护队伍、队员档案、结构化游泳项目、成绩和目标
- 成绩录入同时支持单条快速录入与“训练 / 测试 / 比赛”上下文录入
- 自动提供 PB、阶段趋势、目标进度和项目分析视图
- 公开页面无需登录，可按授权展示运动员成长档案与事件详情
- 支持官方达级标准与自定义达标线
- 支持 CSV 导入导出
- 浏览器请求统一走 `/api/*`，便于反向代理和独立部署

## 产品能力

### 管理端

- 固定管理员登录与会话保护
- 队伍管理与队员归属维护
- 游泳项目管理
- 成绩录入、成绩列表、阶段目标维护
- 官方达级标准与自定义标准管理
- CSV 导入导出

### 公开端

- 公开运动员列表
- 个人详情页与事件详情页
- 成绩时间线与项目分析
- 分享页与移动端友好展示
- 同项目多人对比

### 数据与分析

- 结构化项目定义，保证统计口径稳定
- SQLite 持久化
- PB、趋势与目标进度计算
- 队伍与公开展示状态过滤
- 官方达级评估与自定义达标评估

## 架构概览

```text
Browser
  -> Next.js frontend
  -> /api/* (browser-facing path kept stable)
  -> reverse proxy or Next standalone rewrite
  -> Flask backend
  -> SQLite
```

浏览器始终访问 `/api/*`。

- 如果生产环境前面有反向代理，就让反向代理把 `/api` 转发到 Flask
- 如果直接使用 Next.js standalone 服务器做代理，则由 `frontend/next.config.ts` 中的 rewrite 转发到后端

## 技术栈

- 前端：Next.js 16、React 19、Tailwind CSS 4、Vitest、Testing Library
- 后端：Python 3.12、Flask、SQLite、pytest、ruff
- 工具链：npm、Poetry、uv、OpenSpec

## 仓库结构

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

## 后端包管理：uv + Poetry 最佳组合

当前后端已经整理成“`uv + Poetry` 共用一份依赖声明”的模式。

### 设计原则

- `pyproject.toml` 是唯一依赖真相源
- `dependency-groups` 统一声明 `test / lint / dev`
- `Poetry` 负责稳定锁定与精确同步
- `uv` 负责快速同步与快速运行
- `backend/poetry.toml` 固定使用项目内 `.venv`

### 当前职责划分

- `poetry lock`
  用于重建 `poetry.lock`
- `poetry sync --with dev`
  用于按 `poetry.lock` 精确同步完整开发环境
- `uv lock`
  用于重建 `uv.lock`
- `uv sync`
  用于快速同步开发环境
- `uv run ...`
  用于快速执行测试、lint 和运行命令

### 为什么这样配置

这套方式的优点是：

- `Poetry` 和 `uv` 不再各自维护不同的依赖集合
- 日常开发可享受 `uv` 的速度
- 锁文件和环境同步仍可通过 `Poetry` 做稳定控制
- 同一个工作区在切换机器或切换终端时更容易保持一致

### 推荐工作流

#### 首次进入项目或依赖声明刚改过

```bash
cd backend
poetry sync --with dev
uv sync
```

#### 日常开发

```bash
cd backend
uv sync
uv run python -m swimming_best
```

#### 修改依赖后

```bash
cd backend
poetry lock
uv lock
poetry sync --with dev
uv sync --locked
```

### 说明

- `uv` 与 `Poetry` 当前都使用 `backend/.venv`
- 当前仓库保留了腾讯源配置，方便国内环境同步依赖
- 如果某台机器需要替换为其他镜像，优先通过本地配置覆盖，再考虑是否要改提交配置

## 快速开始

### 1. 安装前端依赖

```bash
npm --prefix frontend install
```

### 2. 初始化后端环境

推荐：

```bash
cd backend
poetry sync --with dev
uv sync
```

### 3. 初始化后端运行时配置

```bash
cp backend/config.example.toml backend/config.toml
```

`backend/config.toml` 是运行期配置文件，不提交到 Git。

### 4. 启动后端

使用 `uv`：

```bash
cd backend
uv run python -m swimming_best
```

使用 `Poetry`：

```bash
cd backend
poetry run python -m swimming_best
```

开发默认账号为 `admin / admin`，仅用于本地环境。

### 5. 启动前端

```bash
npm --prefix frontend run dev
```

如果后端不在 `http://127.0.0.1:8080`，可显式指定：

```bash
BACKEND_ORIGIN=http://127.0.0.1:8080 npm --prefix frontend run dev
```

## 常用命令

```bash
# 前端
npm run frontend:dev
npm run frontend:lint
npm run frontend:test
npm run frontend:build

# 后端
npm run backend:install
npm run backend:sync:uv
npm run backend:lock:poetry
npm run backend:lock:uv
npm run backend:run
npm run backend:run:uv
npm run backend:lint
npm run backend:test

# 一键校验
npm run check

# 统一部署到 /data/product/swimming-best
npm run deploy:product
```

## 配置说明

后端配置文件是 `backend/config.toml`，关键项包括：

- `[server]`：Flask 监听地址和端口
- `[database].path`：SQLite 文件路径
- `[auth].session_secret`：Cookie 会话签名密钥
- `[[auth.admins]]`：管理员账号与密码哈希
- `[app].timezone`：应用默认时区
- `[app].public_base_url`：公开站点对外根地址

## API 与前端路由约定

- 浏览器端统一调用 `/api/public/*` 与 `/api/admin/*`
- React 页面不直接写死生产后端域名
- `frontend/next.config.ts` 中的 `BACKEND_ORIGIN` 只决定 Next.js rewrite 目标

这意味着：

- 有反向代理时，只要把 `/api` 转发到 Flask 即可
- 无反向代理时，可以让 Next.js standalone 自己把 `/api/*` 转发到后端

## 生产部署

统一部署脚本位于 `scripts/deploy.py`：

```bash
python3 scripts/deploy.py
```

默认部署根目录：

- `/data/product/swimming-best/frontend`
- `/data/product/swimming-best/backend`

更多细节见 [docs/deployment.md](docs/deployment.md)。

## 质量验证

推荐验证顺序：

```bash
npm run frontend:lint
npm run frontend:test
npm run frontend:build

cd backend
poetry check --lock
poetry sync --with dev
poetry run python -m pytest tests -q

uv sync --locked
uv run python -m pytest tests -q
uv run ruff check swimming_best tests
```

## 文档与规格

- 部署说明：`docs/deployment.md`
- 设计文档：`docs/superpowers/specs/`
- 实现计划：`docs/superpowers/plans/`
- 规格基线：`openspec/specs/`

## 开发约定

- 运行时配置和数据库文件不纳入 Git
- 新增行为优先通过测试锁定，再改实现
- 发布前至少重新执行受影响验证
- 修改需求或行为时，优先同步对应 OpenSpec

## License

本项目采用 [MIT License](LICENSE)。
