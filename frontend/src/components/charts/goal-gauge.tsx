"use client";

import { motion } from "motion/react";
import { Award, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeMS, formatProgress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GoalProgress } from "@/lib/types";

export function GoalGauge({ goal }: { goal: GoalProgress }) {
  const progressPct = Math.min(Math.max(goal.progress, 0), 1);
  const isAchieved = progressPct >= 1;
  const remaining = goal.targetTimeMs > 0
    ? goal.currentBestTimeMs - goal.targetTimeMs
    : 0;

  // Arc calculations
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference * (1 - progressPct);

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div className="flex w-full items-center justify-between">
           <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isAchieved ? "bg-emerald-100 text-emerald-600" : "bg-primary/5 text-primary"
              )}>
                 {isAchieved ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">{goal.title}</span>
           </div>
           <Badge variant="outline" className="rounded-full h-6 text-[10px] font-bold uppercase tracking-widest border-border/60">
              {goal.horizon === "short" ? "Short" : goal.horizon === "mid" ? "Mid" : "Long"} Term
           </Badge>
        </div>

        {/* Arc gauge */}
        <div className="relative h-32 w-52 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="h-full w-full">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="opacity-40"
            />
            {/* Progress arc with animation */}
            <motion.path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={isAchieved ? "var(--color-emerald-500)" : "var(--primary)"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              style={{
                strokeDasharray: circumference,
                filter: isAchieved ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.2))'
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "text-3xl font-black tracking-tighter",
                isAchieved ? "text-emerald-600" : "text-foreground"
              )}
            >
              {formatProgress(goal.progress)}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/60">
              {isAchieved ? "Target Achieved" : `Remaining ${(remaining / 1000).toFixed(2)}s`}
            </span>
          </div>
        </div>

        {/* Labels Grid */}
        <div className="grid w-full grid-cols-3 gap-2 border-t border-border/40 pt-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">Baseline</span>
            <span className="text-sm font-black text-foreground/80">
              {goal.baselineTimeMs > 0 ? formatTimeMS(goal.baselineTimeMs) : "--"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">Current</span>
            <span className="text-sm font-black text-primary">
              {formatTimeMS(goal.currentBestTimeMs)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">Target</span>
            <span className="text-sm font-black text-foreground/80">
              {formatTimeMS(goal.targetTimeMs)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted/40 bg-surface/50 px-3 py-1.5 rounded-full">
          <Calendar className="h-3 w-3" />
          <span>Deadline: {goal.targetDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
