"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { ImportWizard } from "@/components/shared/import-wizard";

export default function AdminImportPage() {
  return (
    <AdminShell
      description="先预览，再确认导入，避免历史成绩一次性写错。"
      title="导入 CSV"
    >
      <ImportWizard />
    </AdminShell>
  );
}
