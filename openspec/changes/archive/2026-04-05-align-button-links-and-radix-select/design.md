## Context

当前仓库已经统一到一套共享 UI primitives，但仍有两个低层实现偏差会不断污染页面层。

第一，`Button` 组件支持 `asChild`，但现在的实现先把 `children` 包进动画 `span`，再把这个 `span` 交给 `Slot`。结果是 `Link` 并没有成为真正的按钮根节点，按钮样式只落在包装 `span` 上，导致“看起来是按钮，实际上是文本链接里包了个 span”的半成品状态。

第二，项目虽然已经安装了 `@radix-ui/react-select`，但共享 `Select` 依然是原生 `<select>` 加外层装饰。用户已经明确要求按 shadcn 官方 Select 文档对齐，这意味着需要切回 Radix Select 的 Trigger / Content / Item 结构，而不是继续给原生 `<select>` 贴皮。

## Goals / Non-Goals

**Goals:**
- 修复 `Button asChild`，让所有链接按钮真正继承统一按钮样式和交互。
- 让后台头部、后台快速操作、公开页导航三类高频入口表现成同一按钮家族，只做颜色区分。
- 用真正的 shadcn/Radix Select 替换共享 `Select`，并让 `SelectField` 与现有表单结构继续协作。
- 保持现有颜色系统，不做整站重新设计。

**Non-Goals:**
- 不新增新的页面流程或 API。
- 不改动后端逻辑或数据库结构。
- 不把所有表单控件都重写，只处理当前共享按钮/选择器和依赖它们的页面。

## Decisions

### 1. `Button asChild` 回到 shadcn 语义优先
**Decision**: 当 `asChild` 为真时，`Button` 直接把 className 和交互属性交给 `Slot`，不再把 `children` 先包成动画内容根节点。`loading/success` 态仅保留给真实 `button` 场景。
**Rationale**: 链接按钮的首要目标是让 `Link` 成为根节点。继续保留包装动画会破坏 `Slot` 的核心语义。
**Alternative considered**: 为链接单独做 `LinkButton`。被拒绝，因为会放大组件重复和页面分叉。

### 2. 后台与公开页按钮统一成“同族不同色”
**Decision**: 后台头部“查看公开页”与“退出登录”使用同尺寸、同圆角、同字重的胶囊按钮；后台首页快速操作三个入口也统一为同一按钮模版；公开页导航三按钮沿用相同体量与圆角，仅通过色调区分。
**Rationale**: 用户指出的问题不是页面结构，而是同一层级动作缺乏一致的表达。
**Alternative considered**: 各区域单独微调。被拒绝，因为无法从根上消除不一致。

### 3. 共享 Select 直接切成 Radix Select
**Decision**: `frontend/src/components/ui/select.tsx` 重写为基于 `@radix-ui/react-select` 的 shadcn 风格组件，导出 `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` 等 primitives。
**Rationale**: 这是与官方文档对齐的唯一正确路径。当前原生 `<select>` 外壳无法达到一致的弹层、滚动区、图标和状态反馈。
**Alternative considered**: 继续保留原生 `<select>`，只改样式。被拒绝，因为用户要求就是切齐 shadcn 文档组件。

### 4. `SelectField` 负责吸收 API 迁移成本
**Decision**: 在共享 `SelectField` 内部完成从 `onChange(event)` 到 `onValueChange(value)` 的适配，并负责 placeholder / trigger / content 结构，减少各页面重复改造量。
**Rationale**: 绝大多数表单都通过 `SelectField` 接入，集中迁移成本最低。
**Alternative considered**: 各页面直接手写 Radix Select。被拒绝，因为会造成表单层再次分叉。

## Risks / Trade-offs

- [Risk] 改 `Button asChild` 可能影响现有 asChild 场景的 DOM 结构 → Mitigation: 增加壳层与页面测试，优先覆盖头部导航与快速操作按钮。
- [Risk] Radix Select 会改变测试交互方式，原先基于原生 `<select>` 的 `fireEvent.change` / `selectOption` 需要更新 → Mitigation: 同步调整 Vitest 和 Playwright，用真实 trigger/item 交互验证。
- [Risk] 某些页面依赖浏览器原生 select 的键盘行为 → Mitigation: 依赖 Radix Select 自带的可访问性语义，并在关键录入页面回归验证。
