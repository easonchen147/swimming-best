"use client";

import { Award, Calendar, Target } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatProgress, formatTimeMS } from "@/lib/format";
import type { GoalProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

function horizonLabel(horizon: string) {
  if (horizon === "short") return "短期";
  if (horizon === "mid") return "中期";
  return "长期";
}

export function GoalGauge({ goal }: { goal: GoalProgress }) {
  const progressPct = Math.min(Math.max(goal.progress, 0), 1);
  const isAchieved = goal.isAchieved;

  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct);

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isAchieved ? "bg-emerald-100 text-emerald-600" : "bg-primary/5 text-primary",
              )}
            >
              {isAchieved ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            </div>
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              {goal.title}
            </span>
          </div>
          <Badge
            className="h-6 rounded-full border-border/60 text-[10px] font-bold"
            variant="outline"
          >
            {horizonLabel(goal.horizon)}
          </Badge>
        </div>

        <div className="relative flex h-32 w-52 items-center justify-center">
          <svg className="h-full w-full" viewBox="0 0 200 120">
            <path
              className="opacity-40"
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--border)"
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
            <motion.path
              animate={{ strokeDashoffset }}
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              initial={{ strokeDashoffset: circumference }}
              stroke={isAchieved ? "var(--color-emerald-500)" : "var(--primary)"}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              style={{
                strokeDasharray: circumference,
                filter: isAchieved
                  ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))"
                  : "drop-shadow(0 0 8px rgba(79, 70, 229, 0.2))",
              }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <motion.span
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "text-3xl font-black tracking-tighter",
                isAchieved ? "text-emerald-600" : "text-foreground",
              )}
              initial={{ opacity: 0, scale: 0.5 }}
            >
              {formatProgress(goal.progress)}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/60">
              {isAchieved ? "Target Achieved" : `Remaining ${(goal.gapMs / 1000).toFixed(2)}s`}
            </span>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 border-t border-border/40 pt-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
              Baseline
            </span>
            <span className="text-sm font-black text-foreground/80">
              {goal.baselineTimeMs > 0 ? formatTimeMS(goal.baselineTimeMs) : "--"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
              Current
            </span>
            <span className="text-sm font-black text-primary">
              {formatTimeMS(goal.currentBestTimeMs)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
              Target
            </span>
            <span className="text-sm font-black text-foreground/80">
              {formatTimeMS(goal.targetTimeMs)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-surface/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/40">
          <Calendar className="h-3 w-3" />
          <span>截止日期: {goal.targetDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
