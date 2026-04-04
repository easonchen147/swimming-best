"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImprovementChart } from "@/components/charts/improvement-chart";
import { GoalGauge } from "@/components/charts/goal-gauge";
import { PublicShell } from "@/components/layout/public-shell";
import { CustomStandardsPanel } from "@/components/shared/custom-standards-panel";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { OfficialGradePanel } from "@/components/shared/official-grade-panel";
import { SourceTypeBadge } from "@/components/shared/source-type-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicEventAnalytics, getPublicSwimmer } from "@/lib/api/public";
import { formatProgress, formatTimeMS } from "@/lib/format";
import type { PublicEventAnalytics, PublicSwimmerDetail } from "@/lib/types";

export default function PublicEventDetailPage() {
  const params = useParams<{ slug: string; eventId: string }>();
  const slug = params.slug;
  const eventId = params.eventId;

  const [swimmer, setSwimmer] = useState<PublicSwimmerDetail | null>(null);
  const [analytics, setAnalytics] = useState<PublicEventAnalytics | null>(null);

  useEffect(() => {
    Promise.all([getPublicSwimmer(slug), getPublicEventAnalytics(slug, eventId)])
      .then(([swimmerResponse, analyticsResponse]) => {
        setSwimmer(swimmerResponse);
        setAnalytics(analyticsResponse);
      })
      .catch((error: Error) => toast.error(error.message));
  }, [eventId, slug]);

  if (!swimmer || !analytics) {
    return (
      <PublicShell className="gap-6">
        <LoadingState label="项目详情" />
      </PublicShell>
    );
  }

  return (
    <PublicShell className="gap-6">
      <div className="flex flex-wrap gap-3">
        <Link href={`/swimmers/${slug}`}>
          <Button size="sm" variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回成长档案
          </Button>
        </Link>
        <Link href={`/swimmers/${slug}/share/${eventId}`}>
          <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            打开分享页
          </Button>
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="孩子"
          value={swimmer.displayName}
          caption={swimmer.team?.name || "公开成长档案"}
        />
        <MetricCard
          label="当前 PB"
          value={formatTimeMS(analytics.series.currentBestTimeMs)}
          caption={analytics.event.displayName}
        />
        <MetricCard
          label="目标推进"
          value={analytics.goals[0] ? formatProgress(analytics.goals[0].progress) : "未设定"}
          caption={analytics.goals[0]?.title || "目标创建后这里会显示进度"}
        />
      </section>

      <Card>
        <h1 className="text-xl font-semibold text-primary">
          {analytics.event.displayName}
        </h1>
        </Card>

      <ImprovementChart
        benchmarkLines={analytics.benchmarkLines}
        raw={analytics.series.raw}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-primary">成绩时间线</h2>
          {analytics.series.raw.map((point) => (
            <div
              className="flex items-center justify-between rounded-xl border border-primary/8 bg-white px-4 py-2.5"
              key={`${point.performedOn}-${point.timeMs}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{point.performedOn}</span>
                <SourceTypeBadge sourceType={point.sourceType} />
              </div>
              <span className="font-semibold text-primary">{formatTimeMS(point.timeMs)}</span>
            </div>
          ))}
        </Card>

        <div className="space-y-4">
          <OfficialGradePanel
            nextOfficialGrade={analytics.nextOfficialGrade}
            officialGrade={analytics.officialGrade}
            status={analytics.officialGradeStatus}
          />
          <CustomStandardsPanel
            customStandards={analytics.customStandards}
            nextCustomStandard={analytics.nextCustomStandard}
          />

          <h2 className="text-lg font-semibold text-primary">目标与里程碑</h2>
          {analytics.goals.length === 0 ? (
            <Card>
              <div className="py-4 text-center text-sm text-muted">
                暂无公开目标。
              </div>
            </Card>
          ) : (
            analytics.goals.map((goal) => (
              <GoalGauge goal={goal} key={goal.id} />
            ))
          )}
        </div>
      </div>
    </PublicShell>
  );
}
