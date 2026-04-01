# Swimming Best

`Swimming Best` 是一个面向儿童游泳训练场景的成绩管理系统，目标是把成绩录入、PB 识别、趋势分析、目标管理、公开展示和分享统一到一套桌面端/移动端都可用的产品里。

当前仓库采用前后端分离结构：

- `frontend/`: Next.js + React + Tailwind CSS 前端
- `backend/`: Go 1.24.1 + Gin + SQLite 后端
- `openspec/`: OpenSpec 变更、规格与任务
- `docs/`: 设计文档与实现计划

## 快速开始

### 前端

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

### 后端

```powershell
go -C backend run ./cmd/server
```

## 常用命令

```powershell
# 前端 lint
npm run frontend:lint

# 前端构建
npm run frontend:build

# 后端测试
npm run backend:test

# 基础检查
npm run check
```

## 当前状态

当前已经完成需求设计、OpenSpec 提案/规格/任务和仓库骨架，后续会逐步补齐：

- 后端认证、数据模型与 API
- 前端后台与公开端页面
- PB / 趋势 / 目标 / 对比分析
- 桌面端与移动端自适配
- 自动化测试、OpenSpec 验证与归档

