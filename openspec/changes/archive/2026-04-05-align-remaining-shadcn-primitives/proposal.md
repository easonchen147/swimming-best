## Why

在完成 `Button` 和 `Select` 的共享层切换后，前端共享 primitives 还剩两处明显没有对齐官方 shadcn 使用方式的地方。`Label` 仍然是原生 `<label>` 包装，不是 Radix Label；`Badge` 仍然缺少官方组件常见的 `asChild` 和更标准的变体结构。它们不会马上造成页面崩坏，但会继续让共享层处于“部分 shadcn、部分自定义”的混合状态。

这轮需要把剩余的这两个 primitives 收口，同时明确哪些组件属于项目定制而不是“还没切过去”的问题，避免后续重复怀疑同一层。

## What Changes

- 将共享 `Label` 切换到 Radix Label 实现，对齐 shadcn 官方组件使用方式。
- 将共享 `Badge` 补齐更标准的 shadcn 结构与 `asChild` 能力。
- 保持 `Card` / `Input` / `Table` 的项目定制能力，但确认它们不属于之前那种错误的根节点语义偏差。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `uiux-modernization`: 共享 primitives 层必须优先使用官方 shadcn/Radix 组件语义；项目定制仅允许建立在语义正确的 primitive 之上。

## Impact

- **Frontend shared UI**: `frontend/src/components/ui/label.tsx`, `frontend/src/components/ui/badge.tsx`
- **Tests**: 需要补 primitives 级测试，验证 `Label` 和 `Badge` 的基础语义与 `asChild` 行为
