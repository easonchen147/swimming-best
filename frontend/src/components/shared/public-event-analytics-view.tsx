"use client";

import { Calendar, Target } from "lucide-react";

import { GoalGauge } from "@/components/charts/goal-gauge";
import { ImprovementChart } from "@/components/charts/improvement-chart";
import { BenchmarkGapSummary } from "@/components/shared/benchmark-gap-summary";
import { OfficialGradePanel } from "@/components/shared/official-grade-panel";
import { SourceTypeBadge } from "@/components/shared/source-type-badge";
import { Card } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import type { PublicEventAnalytics } from "@/lib/types";

export function PublicEventAnalyticsView({
  analytics,
}: {
  analytics: PublicEventAnalytics;
}) {
  return (
    <div className="flex flex-col gap-8">
      <ImprovementChart
        goals={analytics.goals}
        officialBenchmarks={analytics.officialBenchmarks}
        pb={analytics.series.pb}
        raw={analytics.series.raw}
      />

      <BenchmarkGapSummary
        goals={analytics.goals}
        officialBenchmarks={analytics.officialBenchmarks}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <Card className="space-y-4 border-border/40 p-5 shadow-xl shadow-primary/5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">成绩时间线</h2>
              <p className="text-xs text-muted">按记录时间查看每一次测试、训练或比赛成绩。</p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.series.raw.map((point) => (
              <div
                className="flex flex-col gap-3 rounded-2xl border border-primary/8 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={`${point.performedOn}-${point.timeMs}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted">{point.performedOn}</span>
                  <SourceTypeBadge sourceType={point.sourceType} />
                </div>
                <span className="font-semibold text-primary">{formatTimeMS(point.timeMs)}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <OfficialGradePanel
            nextOfficialGrade={analytics.nextOfficialGrade}
            officialGrade={analytics.officialGrade}
            status={analytics.officialGradeStatus}
          />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Target className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary">目标里程碑</h2>
                <p className="text-xs text-muted">管理员公开的阶段目标会显示在这里。</p>
              </div>
            </div>

            {analytics.goals.length === 0 ? (
              <Card className="border-dashed border-border/60 p-6 text-center text-sm text-muted">
                暂无公开目标。
              </Card>
            ) : (
              analytics.goals.map((goal) => <GoalGauge goal={goal} key={goal.id} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
