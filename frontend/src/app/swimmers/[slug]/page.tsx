"use client";

import { toPng } from "html-to-image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Share2, 
  Target, 
  Users,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";

import { ImprovementChart } from "@/components/charts/improvement-chart";
import { GoalGauge } from "@/components/charts/goal-gauge";
import { CustomStandardsPanel } from "@/components/shared/custom-standards-panel";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { OfficialGradePanel } from "@/components/shared/official-grade-panel";
import { SourceTypeBadge } from "@/components/shared/source-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatProgress, formatTimeMS } from "@/lib/format";
import {
  getPublicEventAnalytics,
  getPublicSwimmer,
  listPublicSwimmerEvents,
} from "@/lib/api/public";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
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
      toast.success("分享图已保存");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <PublicShell>
      {loading || !swimmer ? (
        <div className="grid gap-8">
          <LoadingState label="孩子档案加载中" />
          <LoadingState label="项目分析加载中" />
        </div>
      ) : (
        <motion.div 
          initial="initial"
          animate="animate"
          variants={STAGGER_CONTAINER}
          className="flex flex-col gap-10"
        >
          {/* Magazine-style Hero Section */}
          <section ref={shareRef}>
            <Card className="relative overflow-hidden p-8 md:p-12 border-none shadow-2xl shadow-primary/10">
              <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-4">
                  <motion.div variants={FADE_IN_UP}>
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] border-primary/20 bg-primary/5 text-primary">
                      Performance Profile
                    </Badge>
                  </motion.div>
                  
                  <div className="flex flex-col gap-2">
                    <motion.h1 
                      variants={FADE_IN_UP}
                      className="text-5xl font-black tracking-tight text-foreground md:text-7xl"
                    >
                      {swimmer.displayName}
                    </motion.h1>
                    <motion.p 
                      variants={FADE_IN_UP}
                      className="flex items-center gap-2 text-lg font-bold text-muted/60"
                    >
                      <Users className="h-5 w-5" />
                      {swimmer.team?.name || "Independent Swimmer"}
                    </motion.p>
                  </div>
                </div>

                <motion.div variants={FADE_IN_UP}>
                  <Button 
                    onClick={exportCard} 
                    loading={exporting}
                    variant="primary" 
                    className="rounded-full px-8 h-12 shadow-xl shadow-primary/20"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    保存分享海报
                  </Button>
                </motion.div>
              </div>

              {/* Event Selector */}
              <motion.div 
                variants={FADE_IN_UP}
                className="relative z-10 mt-12 flex flex-wrap gap-2 pt-8 border-t border-border/40"
              >
                {events.map((item) => (
                  <button
                    key={item.event.id}
                    onClick={() => setSelectedEventId(item.event.id)}
                    className={cn(
                      "rounded-full px-5 py-2 text-xs font-bold transition-all active:scale-95",
                      item.event.id === selectedEventId
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-surface text-muted hover:bg-primary/5 hover:text-primary border border-border/40"
                    )}
                  >
                    {item.event.displayName}
                  </button>
                ))}
              </motion.div>
            </Card>
          </section>

          {/* Analytics Section */}
          <AnimatePresence mode="wait">
            {analytics ? (
              <motion.div 
                key={selectedEventId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-10"
              >
                {/* Metric Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="Personal Best (PB)"
                    value={formatTimeMS(analytics.series.currentBestTimeMs)}
                    caption={`${analytics.event.displayName} 历史最佳`}
                  />
                  <MetricCard
                    label="Data Points"
                    value={`${analytics.series.raw.length}`}
                    caption="有效记录数量"
                  />
                  <MetricCard
                    label="Goal Progress"
                    value={
                      analytics.goals[0]
                        ? formatProgress(analytics.goals[0].progress)
                        : "---"
                    }
                    caption={
                      analytics.goals[0]
                        ? analytics.goals[0].title
                        : "暂未设定当前项目目标"
                    }
                  />
                </div>

                {/* Main Chart Card */}
                <motion.div variants={FADE_IN_UP}>
                  <Card className="p-8 shadow-xl shadow-primary/5">
                    <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between">
                       <div>
                          <CardTitle className="text-2xl font-black">进步曲线</CardTitle>
                          <CardDescription>直观查看过去时间里的成绩波动与突破情况</CardDescription>
                       </div>
                       <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <TrendingUp className="h-5 w-5" />
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="h-[400px] w-full">
                          <ImprovementChart
                            benchmarkLines={analytics.benchmarkLines}
                            raw={analytics.series.raw}
                          />
                       </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Split Panels */}
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                  {/* Timeline */}
                  <motion.div variants={FADE_IN_UP}>
                    <Card className="h-full shadow-xl shadow-primary/5">
                      <CardHeader className="pb-6">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                              <Calendar className="h-5 w-5" />
                           </div>
                           <CardTitle className="text-xl">成绩时间轴</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {analytics.series.raw.map((point, index) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group flex items-center justify-between rounded-2xl border border-border/40 bg-surface/30 p-4 transition-all hover:border-primary/20 hover:bg-white"
                              key={`${point.performedOn}-${point.timeMs}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-xs font-bold text-muted uppercase tracking-widest">{point.performedOn}</div>
                                <SourceTypeBadge sourceType={point.sourceType} />
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                                   {formatTimeMS(point.timeMs)}
                                 </span>
                                 <ChevronRight className="h-4 w-4 text-muted/30 group-hover:text-primary transition-colors" />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Standards & Goals */}
                  <motion.div variants={FADE_IN_UP} className="flex flex-col gap-8">
                    <OfficialGradePanel
                      nextOfficialGrade={analytics.nextOfficialGrade}
                      officialGrade={analytics.officialGrade}
                      status={analytics.officialGradeStatus}
                    />
                    <CustomStandardsPanel
                      customStandards={analytics.customStandards}
                      nextCustomStandard={analytics.nextCustomStandard}
                    />

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Award className="h-4 w-4" />
                         </div>
                         <h3 className="text-xl font-bold tracking-tight">目标与成就</h3>
                      </div>
                      
                      {analytics.goals.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="py-12 text-center">
                            <Target className="h-10 w-10 text-muted/20 mx-auto mb-4" />
                            <p className="text-sm font-bold text-muted/40">暂无公开设定的项目目标</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {analytics.goals.map((goal) => (
                            <GoalGauge goal={goal} key={goal.id} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="h-96">
                <LoadingState label="深度项目分析中" />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </PublicShell>
  );
}
