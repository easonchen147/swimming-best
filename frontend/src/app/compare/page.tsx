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
import { Select } from "@/components/ui/select";
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

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => {
        const nextSwimmers = response.swimmers;
        setSwimmers(nextSwimmers);
        setSelectedSwimmerIds(nextSwimmers.slice(0, 2).map((item) => item.id));
        return nextSwimmers[0]?.slug;
      })
      .then((slug) => {
        if (!slug) {
          return null;
        }
        return listPublicSwimmerEvents(slug);
      })
      .then((response) => {
        if (!response) {
          return;
        }
        setEvents(response.events);
        setSelectedEventId(response.events[0]?.event.id ?? "");
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEventId || selectedSwimmerIds.length < 2) {
      return;
    }

    comparePublicEvent(selectedEventId, selectedSwimmerIds)
      .then(setPayload)
      .catch((error: Error) => toast.error(error.message));
  }, [selectedEventId, selectedSwimmerIds]);

  const selectedEvent = useMemo(
    () => events.find((item) => item.event.id === selectedEventId),
    [events, selectedEventId],
  );

  function toggleSwimmer(swimmerId: string) {
    setSelectedSwimmerIds((current) => {
      if (current.includes(swimmerId)) {
        const next = current.filter((item) => item !== swimmerId);
        return next.length >= 2 ? next : current;
      }

      return [...current, swimmerId].slice(-4);
    });
  }

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
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-muted/60"
                  htmlFor="compare-event"
                >
                  共同项目
                </label>
                <Select
                  id="compare-event"
                  onChange={(event) => setSelectedEventId(event.target.value)}
                  value={selectedEventId}
                >
                  {events.map((item) => (
                    <option key={item.event.id} value={item.event.id}>
                      {item.event.displayName}
                    </option>
                  ))}
                </Select>
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
            {payload ? (
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
              <LoadingState label="对比结果加载中" />
            )}
          </div>
        </div>
      )}
    </PublicShell>
  );
}
