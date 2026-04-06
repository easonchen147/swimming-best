## Why

当前导出能力主要是原始 CSV，适合系统处理，但不适合家长、教练或外部沟通场景。用户需要的是一份能快速看懂队员亮点成绩、国家等级、目标里程碑和短期进步表现的导出模板。

需要新增一类“成绩简报导出”，让导出从流水数据升级为更像成绩名片和成绩总结。

## What Changes

- 保留现有 CSV 导出，同时新增摘要型队员成绩导出模板。
- 在导出模板中加入国家达标等级、目标里程碑、近期进步、突出项目等摘要信息。
- 让管理员可以直接打开适合分享/截图/打印的摘要导出视图。

## Capabilities

### New Capabilities
- `swimmer-summary-export`: 定义队员成绩摘要导出模板能力。

### Modified Capabilities
- `data-import-export`: 从仅支持原始 CSV 导出升级为“原始导出 + 摘要导出”双轨能力。
- `progress-goals`: 将目标里程碑与近期进步摘要接入导出模板。
- `official-grade-baseline`: 将国家等级结果接入导出模板。

## Impact

- **Backend**: `backend/swimming_best/import_export.py`, `backend/swimming_best/admin_routes.py`, `backend/swimming_best/services.py`
- **Frontend**: `frontend/src/app/admin/export/swimmers/[swimmerId]/summary/page.tsx`, `frontend/src/components/export/**`, `frontend/src/lib/api/admin.ts`
- **Tests**: 导出模板数据与页面测试
