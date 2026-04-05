"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CompareChart } from "@/components/charts/compare-chart";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <section className="flex flex-col gap-3">
        <Badge className="w-fit">Same Event Compare</Badge>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          同项目进步对比
        </h1>
        <p className="max-w-3xl text-sm font-medium text-muted">
          选择同一个项目下的多位公开档案，对比当前最佳成绩、进步幅度和走势曲线。
        </p>
      </section>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <LoadingState label="对比配置加载中" />
          <LoadingState label="对比结果加载中" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>对比配置</CardTitle>
              <CardDescription>至少选择两位孩子和一个共同项目。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted/60">
                  孩子选择
                </div>
                <div className="flex flex-wrap gap-2">
                  {swimmers.map((swimmer) => {
                    const active = selectedSwimmerIds.includes(swimmer.id);
                    return (
                      <Button
                        className="rounded-full"
                        key={swimmer.id}
                        onClick={() => toggleSwimmer(swimmer.id)}
                        size="sm"
                        type="button"
                        variant={active ? "primary" : "outline"}
                      >
                        {swimmer.displayName}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted/70">
                  当前已选择 {selectedSwimmerIds.length} 位孩子，至少需要 2 位才能生成对比结果。
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-muted/60"
                  htmlFor="compare-event"
                >
                  共同项目
                </label>
                <Select
                  disabled={!primarySelectedSwimmer || eventsLoading || events.length === 0}
                  onValueChange={handleEventChange}
                  value={selectedEventId}
                >
                  <SelectTrigger id={compareEventTriggerId}>
                    <SelectValue
                      placeholder={
                        !primarySelectedSwimmer
                          ? "先选择孩子后再选项目"
                          : eventsLoading
                            ? "项目加载中..."
                            : events.length === 0
                              ? "该孩子暂无可对比项目"
                              : "请选择项目"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((item) => (
                      <SelectItem key={item.event.id} value={item.event.id}>
                        {item.event.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted/70">
                  项目列表会跟随第一个已选中的孩子切换。
                </p>
              </div>

              {selectedEvent ? (
                <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 text-sm text-muted">
                  当前项目：
                  <span className="font-bold text-foreground">
                    {" "}
                    {selectedEvent.event.displayName}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {missingSwimmers ? (
              <SelectionStateCard
                description="请先从左侧至少勾选两位孩子，再继续选择项目并查看成长对比。"
                title="待选择对比的孩子"
              />
            ) : missingEvent ? (
              <SelectionStateCard
                description="孩子已经选好，接下来请选择一个共同项目后再生成对比结果。"
                title="待选择对比项目"
              />
            ) : compareLoading ? (
              <LoadingState label="对比结果加载中" />
            ) : payload ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {payload.swimmers.map((swimmer) => (
                    <Card
                      className="group overflow-hidden transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                      key={swimmer.swimmerId}
                    >
                      <CardContent className="space-y-3 p-6">
                        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">
                          {swimmer.team.name}
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {swimmer.displayName}
                        </h2>
                        <div className="text-3xl font-black tracking-tighter text-primary">
                          {formatTimeMS(swimmer.currentBestTimeMs)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted/60">
                          <span>进步幅度</span>
                          <span className="text-foreground">
                            {swimmer.improvementTimeMs > 0 ? "-" : ""}
                            {formatTimeMS(Math.abs(swimmer.improvementTimeMs))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <CompareChart swimmers={payload.swimmers} />

                <Card className="overflow-hidden border-border/40">
                  <CardHeader className="bg-surface/30">
                    <CardTitle>对比摘要</CardTitle>
                    <CardDescription>当前项目：{payload.event.displayName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {payload.swimmers.map((swimmer) => (
                      <div
                        className="rounded-2xl border border-border/40 bg-surface/40 p-5 transition-all hover:border-primary/20 hover:bg-surface"
                        key={swimmer.swimmerId}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-black text-foreground">
                              {swimmer.displayName}
                            </div>
                            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted/50">
                              {swimmer.team.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-primary">
                              最佳 {formatTimeMS(swimmer.currentBestTimeMs)}
                            </div>
                            <div className="text-sm font-bold text-muted">
                              提升 {(swimmer.improvementRatio * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <SelectionStateCard
                description="当前选择组合暂时没有可展示的对比数据，请尝试切换项目或孩子。"
                title="暂无可用的对比结果"
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
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-border/60 bg-surface/30">
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}
