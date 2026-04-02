# 部署说明

`Swimming Best` 当前采用：

- 前端：Next.js standalone 构建产物
- 后端：Python/Flask 源码 + 运行期配置 + SQLite 数据
- 反向代理：外部入口统一暴露前端站点，并把 `/api/*` 转发到后端

## 一次性结论

- 前端代码里的后端调用统一使用 `/api/*`
- 生产环境应让反向代理把 `/api` 转发给 Flask
- 统一部署脚本默认把 Next.js standalone 的生产 rewrite 目标设为 `http://1.12.247.149:8082/`
- 前端部署脚本路径：`scripts/deploy.py`
- 默认部署目录：
  - `/data/product/swimming-best/frontend`
  - `/data/product/swimming-best/backend`

## 后端配置项

首次部署或本地初始化时，复制：

```bash
cp backend/config.example.toml backend/config.toml
```

核心配置说明：

- `[server].host` / `[server].port`
  - Flask 进程自己的监听地址
  - 这里不是给浏览器访问的公开域名
- `[database].path`
  - SQLite 文件位置
  - 相对路径相对于 `config.toml` 所在目录解析
- `[auth].session_secret`
  - 后台 Cookie 会话签名密钥
  - 生产环境必须更换
- `[[auth.admins]]`
  - 后台管理员账号列表
  - `password_hash` 请填 `generate_password_hash(...)` 生成值
- `[app].timezone`
  - 后端默认时区
- `[app].public_base_url`
  - 对外公开站点根地址，通常填写前端站点域名
  - 例如：`https://swimming.example.com`
  - 当前版本还没有在 API 响应里直接消费它，但部署配置应保持准确，后续生成绝对公开链接会以它为准

## 前端和 `/api`

前端页面不会写死后端域名，浏览器侧请求统一走相对路径：

```text
/api/public/...
/api/admin/...
```

这有两个直接结果：

- 如果你的反向代理已经把 `/api` 转发到后端，前端页面不需要改代码
- 前端“面向浏览器的后端地址”主要由反向代理决定，而不是由 React 页面里写死

`frontend/next.config.ts` 里的 `BACKEND_ORIGIN` 只影响 Next.js standalone 服务器自身的 rewrite 目标。它主要用于：

- 本地开发
- 不经过外部反向代理、直接由 Next.js 服务器代转 `/api` 的部署方式

如果你的线上架构已经由反向代理接管 `/api`，前端页面仍然只请求 `/api/*`。

当前统一部署脚本在**生产构建**时，会把 `BACKEND_ORIGIN` 默认设为：

```text
http://1.12.247.149:8082/
```

脚本内部会在写入构建环境变量前去掉尾部斜杠，因此 Next.js standalone
实际使用的 rewrite 目标是：

```text
http://1.12.247.149:8082/api/*
```

这不会改变浏览器看到的接口路径；浏览器仍然只访问 `/api/*`。

## 统一部署脚本

执行：

```bash
python3 scripts/deploy.py
```

可选参数：

```bash
python3 scripts/deploy.py \
  --target-root /data/product/swimming-best \
  --backend-origin http://1.12.247.149:8082/
```

脚本行为：

1. 运行前端生产构建，生成 standalone 产物
2. 用新构建结果完整替换部署目录下的前端文件
3. 每次前端替换都会清理旧版本 `.next/static`、`public/` 和其他陈旧文件
4. 同步后端运行代码到部署目录
5. 首次部署时，如果目标目录没有 `config.toml`，就用 `config.example.toml` 初始化
6. 后续部署时保留已有 `config.toml`
7. 后续部署时保留后端 `data/`、`resources/`、`runtime/` 等运行期资产，不做覆盖

## 部署目录说明

前端目录：

- 目标：`/data/product/swimming-best/frontend`
- 内容：`server.js`、`.next/static`、运行所需的 standalone 文件、`public/`
- 更新策略：每次部署完整替换，旧版哈希静态资源不会跨版本残留

后端目录：

- 目标：`/data/product/swimming-best/backend`
- 内容：`swimming_best/`、`pyproject.toml`、锁文件、`config.example.toml`
- 更新策略：只覆盖代码，保留 `config.toml`、`data/`、`resources/`、`runtime/`

## 后端运行期资产保护

后端部署时的原则是：**只发代码，不碰生产运行态文件**。

这包括但不限于：

- `config.toml`
- `data/` 中的 SQLite 数据库与 WAL/SHM 文件
- `resources/` 下的外部资源
- `runtime/` 下的缓存、临时状态或其他运行期产物

因此：

- 首次初始化允许根据 `config.example.toml` 生成 `config.toml`
- 一旦生产 `config.toml` 已存在，后续部署不能替换它
- 数据文件和运行期资源文件也不能被部署脚本覆盖或清空

## 去哪里改“前端使用的后端地址”

分两种情况：

1. 你使用反向代理按 `/api` 转发
   - 前端页面不用改
   - 去改反向代理配置，把 `/api` 指到 Flask
2. 你希望 Next.js standalone 自己把 `/api` rewrite 到后端
   - 在部署时设置 `--backend-origin` 或环境变量 `BACKEND_ORIGIN`
   - 这个值会在前端构建阶段写入 `frontend/next.config.ts` 的 rewrite 目标

## 运行提示

部署完成后，常见启动方式示例：

```bash
# 前端
cd /data/product/swimming-best/frontend
HOSTNAME=127.0.0.1 PORT=3000 node server.js

# 后端
cd /data/product/swimming-best/backend
poetry install --only main
poetry run python -m swimming_best
```
