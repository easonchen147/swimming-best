"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Star,
  Users,
  Waves,
  Trophy,
  TimerReset,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { CompareChart } from "@/components/charts/compare-chart";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  comparePublicEvent,
  listPublicSwimmerEvents,
  listPublicSwimmers,
} from "@/lib/api/public";
import { formatTimeMS } from "@/lib/format";
import type {
  ComparePayload,
  PublicSwimmerEventSummary,
  PublicSwimmerSummary,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ComparePage() {
  const [swimmers, setSwimmers] = useState<PublicSwimmerSummary[]>([]);
  const [events, setEvents] = useState<PublicSwimmerEventSummary[]>([]);
  const [selectedSwimmerIds, setSelectedSwimmerIds] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [payload, setPayload] = useState<ComparePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const compareEventTriggerId = "compare-event";

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => setSwimmers(response.swimmers))
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const primarySelectedSwimmer = useMemo(
    () => swimmers.find((item) => item.id === selectedSwimmerIds[0]) ?? null,
    [swimmers, selectedSwimmerIds],
  );

  useEffect(() => {
    const slug = primarySelectedSwimmer?.slug;

    if (!slug) {
      return;
    }

    let cancelled = false;

    listPublicSwimmerEvents(slug)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setEvents(response.events);
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        setEvents([]);
        toast.error(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setEventsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [primarySelectedSwimmer]);

  useEffect(() => {
    if (!selectedEventId || selectedSwimmerIds.length < 2) {
      return;
    }

    let cancelled = false;

    comparePublicEvent(selectedEventId, selectedSwimmerIds)
      .then((response) => {
        if (!cancelled) {
          setPayload(response);
        }
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        setPayload(null);
        toast.error(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setCompareLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEventId, selectedSwimmerIds]);

  const selectedEvent = useMemo(
    () => events.find((item) => item.event.id === selectedEventId),
    [events, selectedEventId],
  );

  function toggleSwimmer(swimmerId: string) {
    const nextSelection = selectedSwimmerIds.includes(swimmerId)
      ? selectedSwimmerIds.filter((item) => item !== swimmerId)
      : selectedSwimmerIds.length >= 4
        ? selectedSwimmerIds
        : [...selectedSwimmerIds, swimmerId];

    if (nextSelection === selectedSwimmerIds) {
      return;
    }

    const primaryChanged = nextSelection[0] !== selectedSwimmerIds[0];
    setSelectedSwimmerIds(nextSelection);
    setPayload(null);

    if (primaryChanged) {
      setCompareLoading(false);
      setEvents([]);
      setEventsLoading(Boolean(nextSelection[0]));
      setSelectedEventId("");
      return;
    }

    setCompareLoading(selectedEventId !== "" && nextSelection.length >= 2);
  }

  function handleEventChange(nextEventId: string) {
    setSelectedEventId(nextEventId);
    setPayload(null);
    setCompareLoading(nextEventId !== "" && selectedSwimmerIds.length >= 2);
  }

  const missingSwimmers = selectedSwimmerIds.length < 2;
  const missingEvent = !missingSwimmers && !selectedEventId;

  return (
    <PublicShell className="gap-8">
      {/* Header Section - Modern & Clean */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded-full bg-primary" />
            <Badge variant="solid" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Comparison Engine
            </Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            进步对比分析
          </h1>
          <p className="max-w-xl text-sm font-medium text-muted-foreground">
            多维度对比学员在相同项目下的最佳成绩、历史趋势与进步幅度。
          </p>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <LoadingState label="加载基础档案..." />
          <LoadingState label="初始化对比引擎..." />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Configuration Sidebar - Integrated */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
                   <Users className="h-3.5 w-3.5" />
                   <span>对比人员</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {swimmers.map((swimmer) => {
                    const active = selectedSwimmerIds.includes(swimmer.id);
                    return (
                      <button
                        key={swimmer.id}
                        onClick={() => toggleSwimmer(swimmer.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                          active 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : "bg-white text-muted-foreground border-border/60 hover:border-primary/40 hover:text-primary"
                        )}
                      >
                        {swimmer.displayName}
                      </button>
                    );
                  })}
                </div>
                <div className="h-px bg-border/40 my-1" />
                
                <div className="flex flex-col gap-3">
                  <label
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60"
                    htmlFor="compare-event"
                  >
                    <Star className="h-3.5 w-3.5" />
                    <span>对比项目</span>
                  </label>
                  <Select
                    disabled={!primarySelectedSwimmer || eventsLoading || events.length === 0}
                    onValueChange={handleEventChange}
                    value={selectedEventId}
                  >
                    <SelectTrigger id={compareEventTriggerId} className="h-11 rounded-xl border-border/60 bg-white">
                      <SelectValue
                        placeholder={
                          !primarySelectedSwimmer
                            ? "先选队员"                            : eventsLoading
                              ? "加载中..."
                              : "请选择项目"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {events.map((item) => (
                        <SelectItem key={item.event.id} value={item.event.id} className="rounded-lg">
                          {item.event.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] leading-relaxed text-muted-foreground/60 italic">
                    * 项目列表随第一位选择的学员动态切换
                  </p>
                </div>
              </div>

              {selectedEvent && (
                <div className="group relative overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-xl shadow-primary/20">
                   <div className="relative z-10 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">当前对比项</div>
                      <div className="text-2xl font-black">{selectedEvent.event.displayName}</div>
                   </div>
                   <Waves className="absolute -bottom-6 -right-6 h-24 w-24 text-white/10 transition-transform group-hover:scale-110" />
                </div>
              )}
            </div>
          </aside>

          {/* Result Main Area */}
          <div className="min-w-0 space-y-8">
            {missingSwimmers ? (
              <SelectionStateCard
                icon={<Users className="h-10 w-10" />}
                description="请从左侧面板选择至少两位学员档案，开启数据对比分析。"
                title="待选对比成员"
              />
            ) : missingEvent ? (
              <SelectionStateCard
                icon={<Star className="h-10 w-10" />}
                description="成员已就绪，请选择一个共同项目以生成详细的成长对比数据。"
                title="待选对比项目"
              />
            ) : compareLoading ? (
              <div className="flex flex-col gap-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                       <LoadingState key={i} label="计算中..." />
                    ))}
                 </div>
                 <div className="h-[400px] animate-pulse rounded-[40px] bg-slate-50" />
              </div>
            ) : payload ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score Cards - Restored to primary feel */}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {payload.swimmers.map((swimmer) => (
                    <Card
                      className="group overflow-hidden border-border/40 transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                      key={swimmer.swimmerId}
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col gap-5">
                           <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                 <div className="text-[10px] font-bold uppercase tracking-wider text-muted/50">
                                    {swimmer.team.name}
                                 </div>
                                 <h2 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                                    {swimmer.displayName}
                                 </h2>
                              </div>
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl font-black group-hover:bg-primary group-hover:text-white transition-all">
                                 {swimmer.displayName.slice(0, 1)}
                              </div>
                           </div>
                           
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40">当前最佳成绩</div>
                              <div className="text-4xl font-black tracking-tighter text-primary">
                                {formatTimeMS(swimmer.currentBestTimeMs)}
                              </div>
                           </div>

                           <div className="flex items-center justify-between border-t border-border/40 pt-6">
                              <div className="flex items-center gap-2">
                                 <Trophy className="h-4 w-4 text-emerald-500" />
                                 <span className="text-xs font-bold text-muted/60 uppercase tracking-widest">总进步</span>
                              </div>
                              <div className="text-lg font-black text-emerald-600">
                                {swimmer.improvementTimeMs > 0 ? "-" : ""}
                                {formatTimeMS(Math.abs(swimmer.improvementTimeMs))}
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Main Comparison Chart */}
                <Card className="overflow-hidden border-border/40 rounded-[40px] shadow-sm">
                   <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-surface/30">
                      <div className="space-y-1">
                         <h3 className="text-xl font-black tracking-tight text-foreground">趋势走势对比</h3>
                         <p className="text-sm font-medium text-muted">基于历史成绩的时间序列分析</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary">
                         <TimerReset className="h-4 w-4" />
                         <span>自动同步</span>
                      </div>
                   </div>
                   <div className="p-8">
                      <CompareChart swimmers={payload.swimmers} />
                   </div>
                </Card>

                {/* Leaderboard Summary */}
                <Card className="overflow-hidden border-border/40 rounded-[40px] shadow-sm">
                  <div className="bg-surface/50 px-8 py-6 border-b border-border/40">
                    <h3 className="text-xl font-black tracking-tight text-foreground">对比数据总览</h3>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    {payload.swimmers.map((swimmer, idx) => (
                      <div
                        className="group flex items-center gap-8 rounded-[24px] border border-border/40 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                        key={swimmer.swimmerId}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-base font-black group-hover:bg-primary group-hover:text-white transition-colors">
                           {idx + 1}
                        </div>
                        
                        <div className="flex flex-1 items-center justify-between">
                           <div>
                              <div className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                                {swimmer.displayName}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/40">
                                {swimmer.team.name}
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-12">
                              <div className="text-right">
                                 <div className="text-[10px] font-bold uppercase tracking-widest text-muted/50">进步率</div>
                                 <div className="text-xl font-black text-emerald-600">
                                    {(swimmer.improvementRatio * 100).toFixed(1)}%
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-[10px] font-bold uppercase tracking-widest text-muted/50">最佳表现</div>
                                 <div className="text-2xl font-black text-primary">
                                    {formatTimeMS(swimmer.currentBestTimeMs)}
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <SelectionStateCard
                icon={<Search className="h-10 w-10" />}
                description="当前组合暂无可展示的对比数据，请尝试切换成员或项目。"
                title="无可用数据"
              />
            )}
          </div>
        </div>
      )}
    </PublicShell>
  );
}

function SelectionStateCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed border-border/60 bg-slate-50/30">
      <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-white text-muted-foreground/20 shadow-sm">
           {icon}
        </div>
        <div className="space-y-1">
           <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
           <p className="max-w-md text-sm leading-relaxed text-muted-foreground/60">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
