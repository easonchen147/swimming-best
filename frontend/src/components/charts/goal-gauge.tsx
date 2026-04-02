"use client";

import { Card } from "@/components/ui/card";
import { formatTimeMS, formatProgress } from "@/lib/format";
import type { GoalProgress } from "@/lib/types";

export function GoalGauge({ goal }: { goal: GoalProgress }) {
  const progressPct = Math.min(Math.max(goal.progress, 0), 1) * 100;
  const isAchieved = progressPct >= 100;
  const remaining = goal.targetTimeMs > 0
    ? goal.currentBestTimeMs - goal.targetTimeMs
    : 0;

  return (
    <Card className="flex flex-col items-center gap-3 px-5 py-5">
      <div className="text-sm font-semibold text-primary">{goal.title}</div>

      {/* Arc gauge */}
      <div className="relative h-28 w-48">
        <svg viewBox="0 0 200 120" className="h-full w-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(15,23,42,0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={isAchieved ? "#10b981" : "#0ea5e9"}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${progressPct * 2.51} 251`}
          />
          {/* Center text */}
          <text
            x="100"
            y="80"
            textAnchor="middle"
            className="text-2xl font-bold"
            fill={isAchieved ? "#10b981" : "#0f172a"}
            fontSize="28"
            fontWeight="700"
          >
            {formatProgress(goal.progress)}
          </text>
          <text
            x="100"
            y="100"
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
          >
            {isAchieved ? "已达成" : `还差 ${(remaining / 1000).toFixed(2)}s`}
          </text>
        </svg>
      </div>

      {/* Labels */}
      <div className="flex w-full justify-between text-xs text-muted">
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider">基线</div>
          <div className="font-semibold text-primary">
            {goal.baselineTimeMs > 0 ? formatTimeMS(goal.baselineTimeMs) : "--"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider">当前</div>
          <div className="font-semibold text-primary">
            {formatTimeMS(goal.currentBestTimeMs)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider">目标</div>
          <div className="font-semibold text-primary">
            {formatTimeMS(goal.targetTimeMs)}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted">
        {goal.horizon === "short" ? "短期" : goal.horizon === "mid" ? "中期" : "长期"} · 截止 {goal.targetDate}
      </div>
    </Card>
  );
}
