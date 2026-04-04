# Backend

这里是 `Swimming Best` 的 Flask 后端，负责：

- 管理员登录与会话保护
- 队伍、孩子、项目、成绩、目标等管理端 API
- 公开运动员列表、详情、项目分析和对比 API
- SQLite 持久化
- 官方达级标准与自定义达标线计算
- CSV 导入导出

## 目录重点

- `swimming_best/app.py`
  Flask app 工厂和 blueprint 注册入口
- `swimming_best/config.py`
  运行时配置加载
- `swimming_best/db.py`
  SQLite schema 和连接管理
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
  官方达级标准评估

## 运行方式

推荐先同步开发依赖：

```bash
poetry sync --with dev
uv sync
```

然后任选一种方式运行：

```bash
poetry run python -m swimming_best
```

或：

```bash
uv run python -m swimming_best
```

## 配置文件

首次运行前请准备：

```bash
cp config.example.toml config.toml
```

运行时配置文件 `config.toml` 不应提交到 Git。

## 测试与检查

```bash
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

当前仓库保留了腾讯源配置，方便国内环境同步依赖；如果需要切换为其他镜像，优先通过本地配置或环境变量覆盖。
