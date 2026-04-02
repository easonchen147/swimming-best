"use client";

import { toPng } from "html-to-image";
import { Target, TimerReset } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PerformanceChart } from "@/components/charts/performance-chart";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
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
          <section
            className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"
            ref={shareRef}
          >
            <Card className="flex flex-col gap-4">
              <Badge>公开成长档案</Badge>
              <div>
                <h1 className="text-3xl font-semibold text-primary md:text-5xl">
                  {swimmer.displayName}
                </h1>
                <p className="mt-3 text-base text-muted">
                  {swimmer.team?.name || "持续记录每一次训练、测试和比赛表现。"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {events.map((item) => (
                  <button
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      item.event.id === selectedEventId
                        ? "border-primary bg-primary text-white"
                        : "border-primary/12 bg-white text-primary hover:bg-primary/6"
                    }`}
                    key={item.event.id}
                    onClick={() => setSelectedEventId(item.event.id)}
                    type="button"
                  >
                    {item.event.displayName}
                  </button>
                ))}
              </div>

              {selectedEventId ? (
                <div className="flex flex-wrap gap-3">
                  <Link href={`/swimmers/${slug}/events/${selectedEventId}`}>
                    <Button size="sm" variant="secondary">
                      打开项目详情
                    </Button>
                  </Link>
                  <Link href={`/swimmers/${slug}/share/${selectedEventId}`}>
                    <Button size="sm">打开分享页</Button>
                  </Link>
                </div>
              ) : null}
            </Card>

            <Card className="flex flex-col gap-4">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
                分享卡片
              </div>
              <div className="rounded-[24px] border border-primary/10 bg-gradient-to-br from-primary to-secondary px-5 py-6 text-white">
                <div className="text-sm text-white/70">当前选中项目</div>
                <div className="mt-2 text-2xl font-semibold">
                  {analytics?.event.displayName ?? "等待项目数据"}
                </div>
                <div className="mt-4 text-4xl font-semibold">
                  {analytics ? formatTimeMS(analytics.series.currentBestTimeMs) : "--"}
                </div>
              </div>
              <Button onClick={exportCard} variant="secondary">
                保存分享图
              </Button>
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

              <PerformanceChart
                pb={analytics.series.pb}
                raw={analytics.series.raw}
                trend={analytics.series.trend}
              />

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <Card className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                      <TimerReset className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
                        Raw Timeline
                      </div>
                      <h2 className="text-xl font-semibold text-primary">成绩时间线</h2>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analytics.series.raw.map((point) => (
                      <div
                        className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white px-4 py-3"
                        key={`${point.performedOn}-${point.timeMs}`}
                      >
                        <span className="text-sm text-muted">{point.performedOn}</span>
                        <span className="font-semibold text-primary">
                          {formatTimeMS(point.timeMs)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
                        Goals
                      </div>
                      <h2 className="text-xl font-semibold text-primary">目标与里程碑</h2>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analytics.goals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-primary/12 px-4 py-4 text-sm text-muted">
                        暂无公开目标，管理员创建后会在这里显示。
                      </div>
                    ) : (
                      analytics.goals.map((goal) => (
                        <div
                          className="rounded-2xl border border-primary/10 bg-white px-4 py-4"
                          key={goal.id}
                        >
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
              </section>
            </>
          ) : (
            <LoadingState label="项目分析" />
          )}
        </>
      )}
    </PublicShell>
  );
}
