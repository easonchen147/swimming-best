"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { SwimmerSummaryReport } from "@/components/export/swimmer-summary-report";
import { getSwimmerSummaryExport } from "@/lib/api/admin";
import type { SwimmerSummaryExport } from "@/lib/types";

export default function AdminSwimmerSummaryExportPage() {
  const params = useParams<{ swimmerId: string }>();
  const swimmerId = params.swimmerId;
  const [summary, setSummary] = useState<SwimmerSummaryExport | null>(null);

  useEffect(() => {
    getSwimmerSummaryExport(swimmerId)
      .then(setSummary)
      .catch((error: Error) => toast.error(error.message));
  }, [swimmerId]);

  return (
    <AdminShell
      description="这里导出的是更适合阅读、截图和分享的队员成绩简报，而不是原始流水 CSV。"
      title="队员成绩简报"
    >
      {summary ? <SwimmerSummaryReport summary={summary} /> : <LoadingState label="成绩简报生成中" />}
    </AdminShell>
  );
}
