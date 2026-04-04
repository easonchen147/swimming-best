"use client";

import { Award, ChevronRight, Flag, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import type { GoalProgress, OfficialBenchmark } from "@/lib/types";

function goalHorizonLabel(horizon: string) {
  if (horizon === "short") return "短期";
  if (horizon === "mid") return "中期";
  return "长期";
}

function sortedOfficialBenchmarks(benchmarks: OfficialBenchmark[]) {
  return [...benchmarks].sort((left, right) => {
    if (left.achieved !== right.achieved) {
      return Number(left.achieved) - Number(right.achieved);
    }
    return left.gapMs - right.gapMs || left.order - right.order;
  });
}

export function BenchmarkGapSummary({
  goals,
  officialBenchmarks,
}: {
  goals: GoalProgress[];
  officialBenchmarks: OfficialBenchmark[];
}) {
  const orderedOfficialBenchmarks = sortedOfficialBenchmarks(officialBenchmarks);

  return (
    <Card className="border-border/40 shadow-xl shadow-primary/5">
      <CardHeader className="gap-3 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black">还差多少秒</CardTitle>
          <p className="text-sm text-muted">
            把自己的目标和国家达级标准放在同一视图里，马上知道下一步该冲哪里。
          </p>
        </div>
        <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
          Growth Checklist
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-3xl border border-border/40 bg-surface/40 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-foreground">我的目标</h3>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-muted">当前还没有公开目标，管理员设定后这里会自动显示。</p>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div
                  className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/80 p-3"
                  key={goal.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {goal.title}
                      </span>
                      <Badge className="rounded-full text-[10px]" variant="outline">
                        {goalHorizonLabel(goal.horizon)}
                      </Badge>
                    </div>
                    {goal.isAchieved ? (
                      <Badge className="rounded-full bg-emerald-500/10 text-emerald-700">
                        已达成
                      </Badge>
                    ) : (
                      <span className="text-sm font-black text-emerald-600">
                        还差 {formatTimeMS(goal.gapMs)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>目标成绩 {formatTimeMS(goal.targetTimeMs)}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>截止 {goal.targetDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-3xl border border-border/40 bg-surface/40 p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-foreground">国家达级</h3>
          </div>
          {orderedOfficialBenchmarks.length === 0 ? (
            <p className="text-sm text-muted">
              当前项目没有可用的国家达级标准，或者学员性别尚未补充。
            </p>
          ) : (
            <div className="space-y-2">
              {orderedOfficialBenchmarks.map((benchmark) => (
                <div
                  className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-background/80 p-3"
                  key={`${benchmark.code}-${benchmark.qualifyingTimeMs}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-foreground">
                        {benchmark.label}
                      </span>
                    </div>
                    {benchmark.achieved ? (
                      <Badge className="rounded-full bg-amber-500/10 text-amber-700">
                        已达成
                      </Badge>
                    ) : (
                      <span className="text-sm font-black text-amber-600">
                        还差 {formatTimeMS(benchmark.gapMs)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    达标线 {formatTimeMS(benchmark.qualifyingTimeMs)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
