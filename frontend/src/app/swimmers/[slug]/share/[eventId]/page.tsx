"use client";

import { toPng } from "html-to-image";
import Link from "next/link";
import { ArrowLeft, Download, Waves, Award, TrendingUp, Target, TimerReset, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { getPublicEventAnalytics, getPublicSwimmer } from "@/lib/api/public";
import { formatProgress, formatTimeMS } from "@/lib/format";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { PublicEventAnalytics, PublicSwimmerDetail } from "@/lib/types";

export default function PublicSharePage() {
  const params = useParams<{ slug: string; eventId: string }>();
  const slug = params.slug;
  const eventId = params.eventId;
  const cardRef = useRef<HTMLDivElement>(null);

  const [swimmer, setSwimmer] = useState<PublicSwimmerDetail | null>(null);
  const [analytics, setAnalytics] = useState<PublicEventAnalytics | null>(null);
  const [exporting, setExporting] = useState(false);

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

    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, // High quality
        backgroundColor: '#f8fafc' 
      });
      const link = document.createElement("a");
      link.download = `PB-${slug}-${eventId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("分享海报已生成并保存");
    } catch {
      toast.error("保存失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  }

  if (!swimmer || !analytics) {
    return (
      <PublicShell>
        <LoadingState label="分享卡片生成中" />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <motion.div 
        initial="initial"
        animate="animate"
        variants={STAGGER_CONTAINER}
        className="flex flex-col gap-8"
      >
        <motion.div variants={FADE_IN_UP} className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/swimmers/${slug}`}>
            <Button size="sm" variant="outline" className="rounded-full px-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回档案详情
            </Button>
          </Link>
          <Button onClick={exportCard} loading={exporting} size="md" className="rounded-full px-8 shadow-xl shadow-primary/20">
            <Download className="mr-2 h-4 w-4" />
            保存至相册
          </Button>
        </motion.div>

        <motion.div variants={FADE_IN_UP} className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
          {/* Share Card Content */}
          <div 
            className="overflow-hidden rounded-[48px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-border/40" 
            ref={cardRef}
          >
            {/* Header / Hero Area */}
            <div className="relative overflow-hidden bg-primary px-10 py-16 text-white md:px-16 md:py-20">
              {/* Decorative Background */}
              <div className="absolute inset-0 z-0">
                 <div className="grid-sheen absolute inset-0 opacity-20" />
                 <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary blur-[100px] opacity-40" />
                 <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent blur-[100px] opacity-20" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-md">
                  <Award className="h-3 w-3 text-accent" />
                  <span>Personal Best Achievement</span>
                </div>
                
                <h1 className="text-5xl font-black tracking-tighter md:text-6xl">{swimmer.displayName}</h1>
                <div className="mt-4 flex items-center gap-2 text-lg font-bold text-white/60">
                  <Users className="h-5 w-5" />
                  <span>{swimmer.team?.name || "Independent Swimmer"}</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 -mt-10 rounded-[48px] bg-white px-10 py-12 md:px-16">
               <div className="flex flex-col items-center gap-10">
                  <div className="flex flex-col items-center text-center">
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted/60 mb-2">Current Event</span>
                     <h2 className="text-3xl font-black tracking-tight text-foreground">{analytics.event.displayName}</h2>
                  </div>

                  <div className="flex flex-col items-center py-6">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary mb-4">
                        <TimerReset className="h-6 w-6" />
                     </div>
                     <span className="text-[12px] font-bold uppercase tracking-[0.5em] text-primary/60 mb-4">Personal Best Time</span>
                     <div className="text-7xl font-black tracking-tighter text-primary md:text-8xl">
                        {formatTimeMS(analytics.series.currentBestTimeMs)}
                     </div>
                  </div>

                  <div className="grid w-full grid-cols-2 gap-6 pt-10 border-t border-border/40">
                     <div className="flex flex-col items-center gap-2 text-center p-6 rounded-3xl bg-surface/50 border border-border/40">
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted/60">Data Points</span>
                        <span className="text-3xl font-black text-foreground">{analytics.series.raw.length}</span>
                     </div>
                     <div className="flex flex-col items-center gap-2 text-center p-6 rounded-3xl bg-surface/50 border border-border/40">
                        <Target className="h-6 w-6 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted/60">Goal Progress</span>
                        <span className="text-3xl font-black text-foreground">
                           {analytics.goals[0] ? formatProgress(analytics.goals[0].progress) : "---"}
                        </span>
                     </div>
                  </div>

                  {/* Branding Footer */}
                  <div className="mt-6 flex flex-col items-center gap-4 pt-10 border-t border-border/40 w-full opacity-60">
                     <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
                           <Waves className="h-4 w-4" />
                        </div>
                        <span className="text-base font-black tracking-tight text-foreground">
                           Swimming <span className="text-primary">Best</span>
                        </span>
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted/40">
                        记录每一次突破 · 让进步被看见
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        <motion.p variants={FADE_IN_UP} className="text-center text-sm font-medium text-muted/60">
           提示：点击保存按钮生成高清海报，适合分享至朋友圈或社交媒体。
        </motion.p>
      </motion.div>
    </PublicShell>
  );
}
