# Frontend

这里是 `Swimming Best` 的 Next.js 前端，负责：

- 管理后台页面
- 公开成长档案页面
- 同项目对比页
- 事件详情和分享页

前端页面对后端的调用统一使用 `/api/*`。

- 浏览器请求始终走 `/api/...`
- `next.config.ts` 里的 `BACKEND_ORIGIN` 只决定 Next.js standalone 服务器的 rewrite 目标
- 如果线上反向代理已经把 `/api` 转发给后端，前端页面代码不需要改后端域名
- 统一生产部署脚本 `../scripts/deploy.py` 默认会把 standalone rewrite 目标设为 `http://1.12.247.149:8082/`

## 本地开发

```bash
npm install
npm run dev
```

如果后端不是运行在 `http://127.0.0.1:8080`，请设置：

```bash
BACKEND_ORIGIN=http://127.0.0.1:8080 npm run dev
```

## 常用命令

```bash
npm run lint
npm run test
npm run build
```

`npm run build` 会生成 Next.js standalone 产物，供 `scripts/deploy.py` 复制到部署目录。

生产部署时，脚本会在构建前端前注入 `BACKEND_ORIGIN`，但浏览器端接口路径仍保持
`/api/*` 不变。

完整项目的启动和验证流程请查看仓库根目录 [README](../README.md)。
