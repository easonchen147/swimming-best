"use client";

import { Award, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  NextOfficialGrade,
  OfficialGrade,
  PublicEventAnalytics,
} from "@/lib/types";

function statusMessage(status: PublicEventAnalytics["officialGradeStatus"]) {
  if (status === "missing_gender") return "补充学员性别信息后可自动计算官方达级状态。";
  if (status === "unavailable_for_event") return "当前选中的项目暂不在官方达级标准范围内。";
  if (status === "no_valid_performance") return "录入正式有效的成绩数据后即可计算官方等级。";
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
    <Card className="shadow-xl shadow-primary/5 border-border/40 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Award className="h-4.5 w-4.5" />
           </div>
           <CardTitle className="text-base font-bold">官方达级标准</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status !== "ok" ? (
          <div className="flex gap-3 p-4 rounded-2xl bg-surface border border-border/40">
             <HelpCircle className="h-5 w-5 text-muted/40 shrink-0" />
             <p className="text-sm font-medium text-muted/80 leading-relaxed">{statusMessage(status)}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/[0.03] border border-primary/10">
               <span className="text-xs font-bold text-muted/60 uppercase tracking-widest">当前评定等级</span>
               {officialGrade ? (
                 <Badge className="rounded-full bg-primary text-white border-transparent px-3 py-0.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                    {officialGrade.label}
                 </Badge>
               ) : (
                 <span className="text-sm font-black text-muted/40 italic tracking-tight">未达三级标准</span>
               )}
            </div>

            {nextOfficialGrade ? (
              <div className="group flex flex-col gap-3 p-4 rounded-2xl border border-border/40 bg-surface/50 transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-muted/40 uppercase tracking-[0.2em]">Next Milestone</span>
                   <Badge variant="outline" className="rounded-full h-5 text-[9px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2">
                      {nextOfficialGrade.label}
                   </Badge>
                </div>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-sm font-medium text-muted/80">距离晋级还差</span>
                   <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                      {formatTimeMS(nextOfficialGrade.gapMs)}
                   </span>
                </div>
                <div className="w-full h-1 rounded-full bg-border/20 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '60%' }} // Purely cosmetic progress bar
                     className="h-full bg-emerald-500/40"
                   />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/40 bg-emerald-500/5">
                 <ShieldCheck className="h-5 w-5 text-emerald-600" />
                 <span className="text-sm font-bold text-emerald-700">恭喜！已达到最高等级评定。</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
