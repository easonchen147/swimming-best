# Swimming Best

`Swimming Best` 是一个面向少儿游泳训练场景的成绩管理系统。
它把零散的成绩录入、PB 识别、趋势回看、目标跟踪、公开展示和分享，
收敛到一套同时适配桌面端后台与移动端公开页面的产品中。

项目当前采用前后端分离架构：

- `frontend/`：Next.js 16 + React 19 + Tailwind CSS 4 前端
- `backend/`：Python 3.12 + Flask + SQLite 后端
- `docs/`：设计文档、实现计划与部署说明
- `openspec/`：归档后的规格变更与基线规格

## 项目亮点

- 管理员后台可维护队伍、孩子档案、结构化游泳项目、成绩和目标
- 成绩录入同时支持单条快速录入与“训练/测试/比赛”上下文录入
- 自动提供 PB、阶段趋势、目标进度和同项目对比视图
- 公开页面无需登录，可按授权展示运动员成长档案与事件详情
- 前端浏览器请求统一走 `/api/*`，便于反向代理与独立部署
- 部署脚本支持前后端统一产出，并对生产运行时配置和数据做保护

## 产品能力

### 管理端

- 固定管理员登录与会话保护
- 队伍管理与孩子归属维护
- 游泳项目管理
- 成绩录入、成绩列表、阶段目标维护

### 公开端

- 公开运动员列表
- 个人详情页与事件详情页
- 同项目多人对比
- 分享页与移动端友好展示

### 数据与分析

- 结构化项目定义，保证统计口径稳定
- SQLite 持久化
- PB、趋势与目标进度计算
- 队伍与公开展示状态过滤

## 架构概览

```text
Browser
  -> Next.js frontend
  -> /api/* (browser-facing path kept stable)
  -> reverse proxy or Next standalone rewrite
  -> Flask backend
  -> SQLite
```

设计上，浏览器始终访问 `/api/*`。
如果生产环境前面有反向代理，就让反向代理把 `/api` 转发到 Flask；
如果直接使用 Next.js standalone 服务器做代理，部署脚本会在构建时写入
真实后端 origin。

## 技术栈

- 前端：Next.js 16、React 19、Tailwind CSS 4、Vitest、Testing Library
- 后端：Python 3.12、Flask、SQLite、pytest、ruff
- 工具链：npm、Poetry、uv、OpenSpec

## 仓库结构

```text
.
├── frontend/                 # Next.js 应用
├── backend/                  # Flask API、配置与测试
├── scripts/deploy.py         # 统一生产部署脚本
├── docs/deployment.md        # 部署说明
├── docs/superpowers/         # 设计与计划文档
└── openspec/                 # 规格基线与归档变更
```

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone <your-fork-or-remote>
cd swimming-best
npm --prefix frontend install
cd backend && uv sync
```

如果本机暂时没有 `uv`，也可以使用 Poetry：

```bash
cd backend
poetry install --with dev
```

### 2. 初始化后端运行时配置

```bash
cp backend/config.example.toml backend/config.toml
```

`backend/config.toml` 是运行期配置文件，不提交到 Git。
首次部署可以由脚本自动从示例文件初始化，后续部署不会覆盖它。

### 3. 启动后端

推荐使用 `uv`：

```bash
cd backend
uv run python -m swimming_best
```

或使用 Poetry：

```bash
cd backend
poetry run python -m swimming_best
```

开发默认账号为 `admin / admin`，仅用于本地环境。

### 4. 启动前端

```bash
npm --prefix frontend run dev
```

本地开发时，如果后端不在 `http://127.0.0.1:8080`，可显式指定：

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
npm run backend:run
npm run backend:lint
npm run backend:test

# 一键校验
npm run check

# 统一部署到 /data/product/swimming-best
npm run deploy:product
```

## 配置说明

后端配置文件为 `backend/config.toml`，关键项包括：

- `[server]`：Flask 进程监听地址和端口
- `[database].path`：SQLite 文件路径
- `[auth].session_secret`：Cookie 会话签名密钥
- `[[auth.admins]]`：管理员账号与密码哈希
- `[app].timezone`：应用默认时区
- `[app].public_base_url`：公开站点对外根地址

`public_base_url` 当前尚未在全部响应里直接消费，但部署时应保持准确，
后续生成绝对公开链接会依赖它。

## API 与前端路由约定

- 浏览器端接口调用统一使用 `/api/public/*` 与 `/api/admin/*`
- React 页面不直接写死生产后端域名
- `frontend/next.config.ts` 中的 `BACKEND_ORIGIN` 只决定
  Next.js standalone 服务器自身的 rewrite 目标

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

当前生产部署的默认后端 origin 为：

```text
http://1.12.247.149:8082/
```

部署脚本会在构建前端时把它归一化为
`http://1.12.247.149:8082`，并将 Next.js standalone 的 `/api/*`
rewrite 目标指向该后端；浏览器侧路径仍保持 `/api/*` 不变。

### 前端部署保证

- 每次部署都会用新构建完整替换 `frontend` 目标目录
- 旧版 `.next/static`、旧版 `public` 文件和其他陈旧产物会被清理
- 不会留下跨版本静态资源残留

### 后端部署保证

- 只部署代码与必要元数据文件
- 首次部署时，如缺少 `config.toml`，可由 `config.example.toml` 初始化
- 后续部署不会覆盖运行期 `config.toml`
- 后续部署不会覆盖或删除 `data/`、`resources/`、`runtime/` 等运行期资产

更多细节见 [docs/deployment.md](docs/deployment.md)。

## 质量验证

建议从干净状态运行：

```bash
npm run frontend:lint
npm run frontend:test
npm run frontend:build
cd backend && poetry run ruff check .
cd backend && poetry run python -m pytest -q
```

如果本机使用 `uv`，后端测试也可以运行：

```bash
cd backend && uv run python -m pytest -q
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

## 贡献

欢迎通过 Issue 或 Pull Request 提交问题和改进建议。
如果要改动产品行为、部署流程或数据模型，建议先同步规格或设计文档，
避免实现和文档再次偏离。

## License

本项目采用 [MIT License](LICENSE)。
