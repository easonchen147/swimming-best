## Context

共享 UI 审计已经确认，当前最关键的 shadcn 体系偏差已经从 `Button` 和 `Select` 中清掉。但继续检查 `frontend/src/components/ui` 后，`Label` 和 `Badge` 仍然保留了早期的轻量自定义实现，未对齐 shadcn 官方推荐的 primitive 语义。

这两处问题和 `Card` / `Input` / `Table` 不同。后者虽然有项目级视觉和 motion 定制，但根节点语义与组件族定位没有明显错误；而 `Label` / `Badge` 仍然缺少官方 primitive 的关键结构，因此更适合作为“剩余未切齐组件”处理。

## Goals / Non-Goals

**Goals:**
- 让 `Label` 使用 Radix Label 根节点，避免继续依赖普通 `label` 包装。
- 让 `Badge` 对齐更标准的 shadcn primitive 结构，并补 `asChild`。
- 用最小改动完成共享层收口，不影响现有页面调用方式。

**Non-Goals:**
- 不重写 `Card` / `Input` / `Table` 的项目定制外观。
- 不新增页面功能。
- 不强行把所有视觉定制都抹平成官方默认样式。

## Decisions

### 1. `Label` 切换到 Radix Label.Root
**Decision**: 共享 `Label` 使用 `@radix-ui/react-label` 的 `Root` 作为基础节点，再叠加项目类名。
**Rationale**: 这能对齐 shadcn 官方组件的语义与无障碍实现，同时不会影响现有 `htmlFor` 用法。

### 2. `Badge` 补齐 `asChild`
**Decision**: 共享 `Badge` 增加 `asChild` 支持，并保留当前项目已使用的变体命名，避免页面层大规模重构。
**Rationale**: 这样既能贴近 shadcn 官方 Badge 的结构，又不会造成现有 Badge 调用面破坏。

### 3. 审计结论显式留在 specs
**Decision**: 在主 spec 中明确“项目定制允许存在，但必须建立在官方 primitive 语义正确的前提上”。
**Rationale**: 这能避免后续把所有定制都误判为“还没切齐官方实现”。

## Risks / Trade-offs

- [Risk] `Badge` 增加 `asChild` 后可能改变少数复杂嵌套场景的 DOM 结构 → Mitigation: 当前仓库未发现此类复杂 Badge 用法，补一条 primitive 级测试即可。
- [Risk] `Label` 切到 Radix 后若页面依赖原生 label 的宽松行为可能出现轻微差异 → Mitigation: 接口保持不变，优先用单测确认基础语义未变。
