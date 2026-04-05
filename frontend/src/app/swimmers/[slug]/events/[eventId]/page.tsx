"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PublicEventAnalyticsView } from "@/components/shared/public-event-analytics-view";
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

  const primaryGoal = analytics.goals[0];

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
          caption={swimmer.team?.name || "公开成长档案"}
          label="队员"
          value={swimmer.displayName}
        />
        <MetricCard
          caption={analytics.event.displayName}
          label="当前 PB"
          value={formatTimeMS(analytics.series.currentBestTimeMs)}
        />
        <MetricCard
          caption={primaryGoal?.title || "目标创建后这里会显示进度"}
          label="目标推进"
          value={primaryGoal ? formatProgress(primaryGoal.progress) : "未设定"}
        />
      </section>

      <Card className="border-border/40 p-5 shadow-xl shadow-primary/5 md:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-primary">
            {analytics.event.displayName}
          </h1>
          <p className="text-sm text-muted">
            这是 {swimmer.displayName} 在该项目下的完整成长视图，包含成绩曲线、达级对标和目标差距。
          </p>
        </div>
      </Card>

      <PublicEventAnalyticsView analytics={analytics} />
    </PublicShell>
  );
}
