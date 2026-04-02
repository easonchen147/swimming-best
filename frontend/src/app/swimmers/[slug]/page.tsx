"use client";

import { toPng } from "html-to-image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ImprovementChart } from "@/components/charts/improvement-chart";
import { GoalGauge } from "@/components/charts/goal-gauge";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { SourceTypeBadge } from "@/components/shared/source-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatProgress, formatTimeMS } from "@/lib/format";
import {
  getPublicEventAnalytics,
  getPublicSwimmer,
  listPublicSwimmerEvents,
} from "@/lib/api/public";
import type {
  PublicEventAnalytics,
  PublicSwimmerDetail,
  PublicSwimmerEventSummary,
} from "@/lib/types";

export default function SwimmerDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const shareRef = useRef<HTMLDivElement>(null);

  const [swimmer, setSwimmer] = useState<PublicSwimmerDetail | null>(null);
  const [events, setEvents] = useState<PublicSwimmerEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [analytics, setAnalytics] = useState<PublicEventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublicSwimmer(slug), listPublicSwimmerEvents(slug)])
      .then(([swimmerResponse, eventsResponse]) => {
        setSwimmer(swimmerResponse);
        setEvents(eventsResponse.events);
        setSelectedEventId(eventsResponse.events[0]?.event.id ?? "");
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    getPublicEventAnalytics(slug, selectedEventId)
      .then(setAnalytics)
      .catch((error: Error) => toast.error(error.message));
  }, [selectedEventId, slug]);

  async function exportCard() {
    if (!shareRef.current) {
      return;
    }

    const dataUrl = await toPng(shareRef.current, { cacheBust: true });
    const link = document.createElement("a");
    link.download = `${slug}-share.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <PublicShell className="gap-6">
      {loading || !swimmer ? (
        <>
          <LoadingState label="孩子档案" />
          <LoadingState label="项目分析" />
        </>
      ) : (
        <>
          <section ref={shareRef}>
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge>成长档案</Badge>
                  <h1 className="mt-2 text-2xl font-semibold text-primary md:text-4xl">
                    {swimmer.displayName}
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    {swimmer.team?.name || "持续记录每一次训练、测试和比赛表现。"}
                  </p>
                </div>
                <Button onClick={exportCard} size="sm" variant="secondary">
                  保存分享图
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {events.map((item) => (
                  <button
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      item.event.id === selectedEventId
                        ? "bg-primary text-white"
                        : "border-primary/10 text-primary hover:bg-primary/6"
                    }`}
                    key={item.event.id}
                    onClick={() => setSelectedEventId(item.event.id)}
                    type="button"
                  >
                    {item.event.displayName}
                  </button>
                ))}
              </div>
            </Card>
          </section>

          {analytics ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="当前 PB"
                  value={formatTimeMS(analytics.series.currentBestTimeMs)}
                  caption={analytics.event.displayName}
                />
                <MetricCard
                  label="有效成绩"
                  value={`${analytics.series.raw.length}`}
                  caption="参与趋势计算的有效成绩点"
                />
                <MetricCard
                  label="目标进度"
                  value={
                    analytics.goals[0]
                      ? formatProgress(analytics.goals[0].progress)
                      : "未设定"
                  }
                  caption={
                    analytics.goals[0]
                      ? analytics.goals[0].title
                      : "创建目标后这里会展示推进度"
                  }
                />
              </section>

              <ImprovementChart
                pb={analytics.series.pb}
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
                      <span className="font-semibold text-primary">
                        {formatTimeMS(point.timeMs)}
                      </span>
                    </div>
                  ))}
                </Card>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-primary">目标与里程碑</h2>
                  {analytics.goals.length === 0 ? (
                    <Card>
                      <div className="py-4 text-center text-sm text-muted">
                        暂无公开目标，管理员创建后会在这里显示。
                      </div>
                    </Card>
                  ) : (
                    analytics.goals.map((goal) => (
                      <GoalGauge goal={goal} key={goal.id} />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <LoadingState label="项目分析" />
          )}
        </>
      )}
    </PublicShell>
  );
}
