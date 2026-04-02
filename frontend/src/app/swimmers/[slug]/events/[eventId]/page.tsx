"use client";

import Link from "next/link";
import { ArrowLeft, Share2, TimerReset } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PerformanceChart } from "@/components/charts/performance-chart";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <TimerReset className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
              Event Analytics
            </div>
            <h1 className="text-2xl font-semibold text-primary">
              {analytics.event.displayName}
            </h1>
          </div>
        </div>
      </Card>

      <PerformanceChart
        pb={analytics.series.pb}
        raw={analytics.series.raw}
        trend={analytics.series.trend}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <h2 className="text-xl font-semibold text-primary">成绩时间线</h2>
          <div className="mt-4 space-y-3">
            {analytics.series.raw.map((point) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white px-4 py-3"
                key={`${point.performedOn}-${point.timeMs}`}
              >
                <span className="text-sm text-muted">{point.performedOn}</span>
                <span className="font-semibold text-primary">{formatTimeMS(point.timeMs)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-primary">目标与里程碑</h2>
          <div className="mt-4 space-y-3">
            {analytics.goals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/12 px-4 py-4 text-sm text-muted">
                暂无公开目标。
              </div>
            ) : (
              analytics.goals.map((goal) => (
                <div className="rounded-2xl border border-primary/10 bg-white px-4 py-4" key={goal.id}>
                  <div className="font-semibold text-primary">{goal.title}</div>
                  <div className="mt-2 text-sm text-muted">
                    截止 {goal.targetDate} · 目标 {formatTimeMS(goal.targetTimeMs)}
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-primary/8">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${Math.max(6, goal.progress * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm font-semibold text-primary">
                    {formatProgress(goal.progress)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
