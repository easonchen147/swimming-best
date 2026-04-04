"use client";

import { toPng } from "html-to-image";
import { Share2, Users, Waves } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PublicEventAnalyticsView } from "@/components/shared/public-event-analytics-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPublicEventAnalytics,
  getPublicSwimmer,
  listPublicSwimmerEvents,
} from "@/lib/api/public";
import { formatProgress, formatTimeMS } from "@/lib/format";
import type {
  PublicEventAnalytics,
  PublicSwimmerDetail,
  PublicSwimmerEventSummary,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SwimmerDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const shareRef = useRef<HTMLDivElement>(null);

  const [swimmer, setSwimmer] = useState<PublicSwimmerDetail | null>(null);
  const [events, setEvents] = useState<PublicSwimmerEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [analytics, setAnalytics] = useState<PublicEventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

    setExporting(true);
    try {
      const dataUrl = await toPng(shareRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${slug}-performance.png`;
      link.href = dataUrl;
      link.click();
      toast.success("分享海报已保存");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  if (loading || !swimmer) {
    return (
      <PublicShell>
        <div className="grid gap-8">
          <LoadingState label="孩子档案加载中" />
          <LoadingState label="项目分析加载中" />
        </div>
      </PublicShell>
    );
  }

  const primaryGoal = analytics?.goals[0];

  return (
    <PublicShell className="gap-8">
      <section ref={shareRef}>
        <Card className="relative overflow-hidden border-border/40 p-6 shadow-2xl shadow-primary/10 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Badge className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]" variant="outline">
                Performance Profile
              </Badge>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
                  {swimmer.displayName}
                </h1>
                <p className="flex items-center gap-2 text-base font-semibold text-muted/70 md:text-lg">
                  <Users className="h-5 w-5" />
                  {swimmer.team?.name || "Independent Swimmer"}
                </p>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-muted md:text-base">
                从单次冲刺到长期目标，把每个项目的 PB、国家达级和阶段目标放进同一套成长视图里。
              </p>
            </div>

            <Button
              className="rounded-full px-7"
              disabled={exporting}
              onClick={exportCard}
              variant="primary"
            >
              <Share2 className="h-4 w-4" />
              {exporting ? "正在保存..." : "保存分享海报"}
            </Button>
          </div>

          <div className="relative z-10 mt-8 space-y-3 border-t border-border/40 pt-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted/50">
              <Waves className="h-4 w-4 text-primary" />
              选择项目
            </div>
            <div className="flex flex-wrap gap-2">
              {events.map((item) => (
                <button
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95",
                    item.event.id === selectedEventId
                      ? "border-transparent bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-border/60 bg-background text-muted hover:border-primary/20 hover:bg-primary/5 hover:text-primary",
                  )}
                  key={item.event.id}
                  onClick={() => setSelectedEventId(item.event.id)}
                  type="button"
                >
                  {item.event.displayName}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {!analytics ? (
        <LoadingState label="深度项目分析中" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              caption={`${analytics.event.displayName} 历史最佳`}
              label="PB"
              value={formatTimeMS(analytics.series.currentBestTimeMs)}
            />
            <MetricCard
              caption="有效成绩记录数量"
              label="记录数"
              value={`${analytics.series.raw.length}`}
            />
            <MetricCard
              caption={primaryGoal?.title || "暂未设定当前项目目标"}
              label="目标进度"
              value={primaryGoal ? formatProgress(primaryGoal.progress) : "--"}
            />
          </section>

          <PublicEventAnalyticsView analytics={analytics} />
        </>
      )}
    </PublicShell>
  );
}
