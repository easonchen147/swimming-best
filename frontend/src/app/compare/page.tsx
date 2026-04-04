"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { comparePublicEvent, listPublicSwimmerEvents, listPublicSwimmers } from "@/lib/api/public";
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
        if (!slug) return null;
        return listPublicSwimmerEvents(slug);
      })
      .then((response) => {
        if (!response) return;
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
          选择同一个项目下的多个公开档案，对比当前最好成绩、进步幅度和趋势结果。
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
              <CardDescription>至少选择两位学员和一个共同项目</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted/60">
                  学员选择
                </div>
                <div className="flex flex-wrap gap-2">
                  {swimmers.map((swimmer) => {
                    const active = selectedSwimmerIds.includes(swimmer.id);
                    return (
                      <button
                        key={swimmer.id}
                        onClick={() => toggleSwimmer(swimmer.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-surface text-foreground hover:border-primary/20 hover:bg-primary/5"
                        }`}
                        type="button"
                      >
                        {swimmer.displayName}
                      </button>
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
                <select
                  id="compare-event"
                  value={selectedEventId}
                  onChange={(event) => setSelectedEventId(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground"
                >
                  {events.map((item) => (
                    <option key={item.event.id} value={item.event.id}>
                      {item.event.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent ? (
                <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 text-sm text-muted">
                  当前项目：<span className="font-bold text-foreground">{selectedEvent.event.displayName}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {payload ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {payload.swimmers.map((swimmer) => (
                    <Card key={swimmer.swimmerId}>
                      <CardContent className="space-y-3 p-6">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted/60">
                          {swimmer.team.name}
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">
                          {swimmer.displayName}
                        </h2>
                        <div className="text-3xl font-black text-primary">
                          {formatTimeMS(swimmer.currentBestTimeMs)}
                        </div>
                        <div className="text-sm text-muted">
                          进步 {swimmer.improvementTimeMs > 0 ? "-" : ""}
                          {formatTimeMS(Math.abs(swimmer.improvementTimeMs))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>对比摘要</CardTitle>
                    <CardDescription>
                      当前项目：{payload.event.displayName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {payload.swimmers.map((swimmer) => (
                      <div
                        key={swimmer.swimmerId}
                        className="rounded-2xl border border-border/50 bg-surface/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-bold text-foreground">
                              {swimmer.displayName}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted/60">
                              {swimmer.team.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-primary">
                              最佳 {formatTimeMS(swimmer.currentBestTimeMs)}
                            </div>
                            <div className="text-sm text-muted">
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
