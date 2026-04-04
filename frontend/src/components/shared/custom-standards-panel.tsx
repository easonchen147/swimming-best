"use client";

import { HelpCircle, ListChecks, Target } from "lucide-react";

import { StandardBadge } from "@/components/shared/standard-badge";
import { StandardProgress } from "@/components/shared/standard-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomBenchmark, NextCustomBenchmark } from "@/lib/types";

export function CustomStandardsPanel({
  customStandards,
  nextCustomStandard,
}: {
  customStandards: CustomBenchmark[];
  nextCustomStandard: NextCustomBenchmark | null;
}) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-xl shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4.5 w-4.5" />
          </div>
          <CardTitle className="text-base font-bold">自定义标准</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {customStandards.length === 0 ? (
          <div className="flex gap-3 rounded-2xl border border-border/40 bg-surface p-4">
            <HelpCircle className="h-5 w-5 shrink-0 text-muted/40" />
            <p className="text-sm font-medium leading-relaxed text-muted/80">
              当前项目还没有配置教练自定义的 benchmark 标准。
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {customStandards.map((standard) => (
                <StandardBadge
                  colorHex={standard.colorHex}
                  key={`${standard.standardId}-${standard.gender}`}
                  label={`${standard.tierGroup} · ${standard.name}${standard.achieved ? " 已达成" : ""}`}
                />
              ))}
            </div>

            <div className="border-t border-border/40 pt-4">
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
                  Progress Details
                </span>
              </div>
              <StandardProgress nextStandard={nextCustomStandard} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
