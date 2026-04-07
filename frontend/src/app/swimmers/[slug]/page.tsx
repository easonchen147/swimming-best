"use client";

import { toPng } from "html-to-image";
import { Download, Users, Waves } from "lucide-react";
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
  const captureRef = useRef<HTMLDivElement>(null);

  const [swimmer, setSwimmer] = useState<PublicSwimmerDetail | null>(null);
  const [events, setEvents] = useState<PublicSwimmerEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [analytics, setAnalytics] = useState<PublicEventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

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

  async function exportLongImage() {
    if (!captureRef.current || !analytics) {
      return;
    }

    setCapturing(true);
    try {
      const exportWidth = captureRef.current.scrollWidth;
      const exportHeight = captureRef.current.scrollHeight;
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#f8fafc",
        cacheBust: true,
        canvasHeight: exportHeight * 2,
        canvasWidth: exportWidth * 2,
        height: exportHeight,
        pixelRatio: 1,
        skipAutoScale: true,
        width: exportWidth,
      });
      const link = document.createElement("a");
      link.download = `${slug}-full-profile.png`;
      link.href = dataUrl;
      link.click();
      toast.success("整页长图已保存");
    } catch {
      toast.error("长图生成失败，请重试");
    } finally {
      setCapturing(false);
    }
  }

  if (loading || !swimmer) {
    return (
      <PublicShell>
        <div className="grid gap-8">
          <LoadingState label="队员档案加载中" />
          <LoadingState label="项目分析加载中" />
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell className="gap-12">
      {analytics ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-99999px] top-0 w-[1200px]"
        >
          <div data-testid="swimmer-detail-capture" ref={captureRef}>
            <SwimmerProfileContent
              analytics={analytics}
              events={events}
              exportMode
              onSelectEventId={setSelectedEventId}
              selectedEventId={selectedEventId}
              swimmer={swimmer}
            />
          </div>
        </div>
      ) : null}

      <SwimmerProfileContent
        analytics={analytics}
        capturing={capturing}
        events={events}
        onExport={exportLongImage}
        onSelectEventId={setSelectedEventId}
        selectedEventId={selectedEventId}
        swimmer={swimmer}
      />
    </PublicShell>
  );
}

function SwimmerProfileContent({
  swimmer,
  events,
  selectedEventId,
  onSelectEventId,
  analytics,
  exportMode = false,
  capturing = false,
  onExport,
}: {
  swimmer: PublicSwimmerDetail;
  events: PublicSwimmerEventSummary[];
  selectedEventId: string;
  onSelectEventId: (eventId: string) => void;
  analytics: PublicEventAnalytics | null;
  exportMode?: boolean;
  capturing?: boolean;
  onExport?: () => void;
}) {
  const primaryGoal = analytics?.goals[0];

  return (
    <div className="flex flex-col gap-12">
      <section>
        <Card className="relative overflow-hidden border-border/40 p-6 shadow-2xl shadow-primary/10 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Badge
                className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                variant="outline"
              >
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

            {!exportMode ? (
              <Button
                className="rounded-full px-7"
                disabled={capturing || !analytics}
                onClick={onExport}
                variant="primary"
              >
                <Download className="h-4 w-4" />
                {capturing ? "正在生成长图..." : "下载整页长图"}
              </Button>
            ) : null}
          </div>

          <div className="relative z-10 mt-8 space-y-3 border-t border-border/40 pt-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted/50">
              <Waves className="h-4 w-4 text-primary" />
              当前项目
            </div>
            <div className="flex flex-wrap gap-2">
              {events.map((item) => {
                const selected = item.event.id === selectedEventId;
                return (
                  <Button
                    className={cn(
                      "rounded-full",
                      selected ? "shadow-lg shadow-primary/20" : "",
                    )}
                    disabled={exportMode}
                    key={item.event.id}
                    onClick={() => onSelectEventId(item.event.id)}
                    size="sm"
                    type="button"
                    variant={selected ? "primary" : "outline"}
                  >
                    {item.event.displayName}
                  </Button>
                );
              })}
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

          <section>
            <PublicEventAnalyticsView analytics={analytics} />
          </section>
        </>
      )}
    </div>
  );
}
