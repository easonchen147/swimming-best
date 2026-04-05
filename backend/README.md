# Backend

这里是 `Swimming Best` 的 Python 后端，负责：

- 管理员登录与会话保护
- 队伍、队员、项目、成绩、目标等管理端 API
- 公开档案列表、详情、项目分析和对比 API
- SQLite 持久化
- 国家游泳达级标准与内置项目目录
- CSV 导入导出

## 目录重点

- `swimming_best/app.py`
  Flask app 工厂和 blueprint 注册入口
- `swimming_best/config.py`
  运行时配置加载
- `swimming_best/db.py`
  SQLite schema、迁移和初始化逻辑
- `swimming_best/repository.py`
  核心数据访问层
- `swimming_best/services.py`
  Admin / Public 业务聚合层
- `swimming_best/admin_routes.py`
  管理端 API
- `swimming_best/public_routes.py`
  公开端 API
- `swimming_best/import_export.py`
  CSV 导入导出
- `swimming_best/official_grade_baseline.py`
  官方达级标准读取与评估

## 运行方式

推荐先同步开发依赖：

```bash
cd backend
poetry sync --with dev
uv sync
```

然后任选一种方式启动：

```bash
cd backend
poetry run python -m swimming_best
```

或：

```bash
cd backend
uv run python -m swimming_best
```

当前默认运行策略是：

- Linux 环境默认使用 `gunicorn`
- Windows 环境默认回退到 `waitress`

如果你明确要切回 Flask 自带开发服务器，可以显式加环境变量：

```bash
cd backend
SWIMMING_BEST_USE_FLASK_DEV=1 uv run python -m swimming_best
```

仓库根目录还提供了 Linux 风格启动脚本：

```bash
./scripts/run_backend.sh start
./scripts/run_backend.sh start --nohup
./scripts/run_backend.sh status
./scripts/run_backend.sh logs
```

## 配置文件

首次运行前请准备：

```bash
cp backend/config.example.toml backend/config.toml
```

运行时配置文件 `backend/config.toml` 不应提交到 Git。

## 测试与检查

```bash
cd backend
poetry check --lock
poetry run python -m pytest tests -q

uv sync --locked
uv run python -m pytest tests -q
uv run ruff check swimming_best tests
```

## 包管理约定

当前后端采用 `uv + Poetry` 组合：

- `pyproject.toml` 是依赖真相源
- `poetry.lock` 和 `uv.lock` 同时维护
- `dependency-groups` 统一声明 `test / lint / dev`
- `poetry.toml` 固定使用项目内 `.venv`

## 说明

仓库当前保留了腾讯源配置，方便国内环境同步依赖。如果某台机器需要切换到其他镜像，优先通过本地配置或环境变量覆盖，不要直接删除仓库里的国内源设置。
