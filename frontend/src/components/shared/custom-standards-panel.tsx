"use client";

import { Target, ListChecks, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StandardBadge } from "@/components/shared/standard-badge";
import { StandardProgress } from "@/components/shared/standard-progress";
import { cn } from "@/lib/utils";
import type { CustomBenchmark, NextCustomBenchmark } from "@/lib/types";

export function CustomStandardsPanel({
  customStandards,
  nextCustomStandard,
}: {
  customStandards: CustomBenchmark[];
  nextCustomStandard: NextCustomBenchmark | null;
}) {
  return (
    <Card className="shadow-xl shadow-primary/5 border-border/40 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-4.5 w-4.5" />
           </div>
           <CardTitle className="text-base font-bold">自定义评价标准</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {customStandards.length === 0 ? (
          <div className="flex gap-3 p-4 rounded-2xl bg-surface border border-border/40">
             <HelpCircle className="h-5 w-5 text-muted/40 shrink-0" />
             <p className="text-sm font-medium text-muted/80 leading-relaxed">当前选中的项目暂未设定任何教练自定义 Benchmark。</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {customStandards.map((standard) => (
                <StandardBadge
                  colorHex={standard.colorHex}
                  key={`${standard.standardId}-${standard.gender}`}
                  label={`${standard.tierGroup} · ${standard.name}${standard.achieved ? " ✓" : ""}`}
                />
              ))}
            </div>
            
            <div className="pt-4 border-t border-border/40">
               <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="h-4 w-4 text-muted/40" />
                  <span className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">Progress Details</span>
               </div>
               <StandardProgress nextStandard={nextCustomStandard} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
