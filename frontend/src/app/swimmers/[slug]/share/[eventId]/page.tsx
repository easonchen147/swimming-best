"use client";

import { toPng } from "html-to-image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicEventAnalytics, getPublicSwimmer } from "@/lib/api/public";
import { formatProgress, formatTimeMS } from "@/lib/format";
import type { PublicEventAnalytics, PublicSwimmerDetail } from "@/lib/types";

export default function PublicSharePage() {
  const params = useParams<{ slug: string; eventId: string }>();
  const slug = params.slug;
  const eventId = params.eventId;
  const cardRef = useRef<HTMLDivElement>(null);

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

  async function exportCard() {
    if (!cardRef.current) {
      return;
    }

    const dataUrl = await toPng(cardRef.current, { cacheBust: true });
    const link = document.createElement("a");
    link.download = `${slug}-${eventId}-share.png`;
    link.href = dataUrl;
    link.click();
  }

  if (!swimmer || !analytics) {
    return (
      <PublicShell className="gap-6">
        <LoadingState label="分享卡片" />
      </PublicShell>
    );
  }

  return (
    <PublicShell className="gap-6">
      <div className="flex flex-wrap gap-3">
        <Link href={`/swimmers/${slug}/events/${eventId}`}>
          <Button size="sm" variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回项目详情
          </Button>
        </Link>
        <Button onClick={exportCard} size="sm">
          <Download className="mr-2 h-4 w-4" />
          保存分享图
        </Button>
      </div>

      <div className="mx-auto w-full max-w-3xl" ref={cardRef}>
        <Card className="overflow-hidden bg-gradient-to-br from-primary via-secondary to-[#0f5dd7] text-white">
          <Badge className="border-white/20 bg-white/10 text-white">PB Share</Badge>
          <div className="mt-6 text-sm uppercase tracking-[0.22em] text-white/70">
            Swimming Best
          </div>
          <h1 className="mt-3 text-4xl font-semibold">{swimmer.displayName}</h1>
          <p className="mt-2 text-base text-white/80">
            {swimmer.team?.name || "公开成长档案"}
          </p>

          <div className="mt-8 rounded-[28px] bg-white/10 px-5 py-6 backdrop-blur">
            <div className="text-sm text-white/70">当前项目</div>
            <div className="mt-2 text-2xl font-semibold">{analytics.event.displayName}</div>
            <div className="mt-5 text-sm text-white/70">当前 PB</div>
            <div className="mt-2 text-5xl font-semibold">
              {formatTimeMS(analytics.series.currentBestTimeMs)}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white/10 px-4 py-4">
                <div className="text-sm text-white/70">有效成绩</div>
                <div className="mt-2 text-3xl font-semibold">{analytics.series.raw.length}</div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4">
                <div className="text-sm text-white/70">目标推进</div>
                <div className="mt-2 text-3xl font-semibold">
                  {analytics.goals[0] ? formatProgress(analytics.goals[0].progress) : "未设定"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
