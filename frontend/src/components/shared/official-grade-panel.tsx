"use client";

import { Award, HelpCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import type {
  NextOfficialGrade,
  OfficialGrade,
  PublicEventAnalytics,
} from "@/lib/types";

function statusMessage(status: PublicEventAnalytics["officialGradeStatus"]) {
  if (status === "missing_gender") {
    return "补充学员性别信息后，系统才能自动匹配对应的国家达级标准。";
  }
  if (status === "unavailable_for_event") {
    return "当前项目暂不在内置的国家游泳达级标准范围内。";
  }
  if (status === "no_valid_performance") {
    return "录入有效成绩后，这里会自动计算当前达级状态。";
  }
  return "";
}

export function OfficialGradePanel({
  officialGrade,
  nextOfficialGrade,
  status,
}: {
  officialGrade: OfficialGrade | null;
  nextOfficialGrade: NextOfficialGrade | null;
  status: PublicEventAnalytics["officialGradeStatus"];
}) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-xl shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Award className="h-4.5 w-4.5" />
          </div>
          <CardTitle className="text-base font-bold">国家达级标准</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {status !== "ok" ? (
          <div className="flex gap-3 rounded-2xl border border-border/40 bg-surface p-4">
            <HelpCircle className="h-5 w-5 shrink-0 text-muted/40" />
            <p className="text-sm font-medium leading-relaxed text-muted/80">
              {statusMessage(status)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted/60">
                当前评定等级
              </span>
              {officialGrade ? (
                <Badge className="rounded-full border-transparent bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                  {officialGrade.label}
                </Badge>
              ) : (
                <span className="text-sm font-black italic tracking-tight text-muted/40">
                  暂未达到三级标准
                </span>
              )}
            </div>

            {nextOfficialGrade ? (
              <div className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-surface/50 p-4 transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/40">
                    Next Official Grade
                  </span>
                  <Badge
                    className="h-5 rounded-full border-emerald-500/20 bg-emerald-500/5 px-2 text-[9px] font-bold text-emerald-600"
                    variant="outline"
                  >
                    {nextOfficialGrade.label}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium text-muted/80">距离晋级还差</span>
                  <span className="text-2xl font-black tracking-tighter text-emerald-600">
                    {formatTimeMS(nextOfficialGrade.gapMs)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-border/20">
                  <motion.div
                    animate={{ width: "60%" }}
                    className="h-full bg-emerald-500/40"
                    initial={{ width: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-emerald-500/5 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">
                  已达到当前内置标准中的最高等级。
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
