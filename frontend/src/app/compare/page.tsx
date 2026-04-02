"use client";

import { useEffect, useState } from "react";

import { CompareChart } from "@/components/charts/compare-chart";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { comparePublicEvent, listPublicSwimmerEvents, listPublicSwimmers } from "@/lib/api/public";
import { formatTimeMS } from "@/lib/format";
import { describeSwimmer } from "@/lib/swimmer-label";
import type { ComparePayload, PublicSwimmerSummary, PublicSwimmerEventSummary } from "@/lib/types";

export default function ComparePage() {
  const [swimmers, setSwimmers] = useState<PublicSwimmerSummary[]>([]);
  const [selectedSwimmers, setSelectedSwimmers] = useState<string[]>([]);
  const [events, setEvents] = useState<PublicSwimmerEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [comparePayload, setComparePayload] = useState<ComparePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => {
        setSwimmers(response.swimmers);
        const initialIds = response.swimmers.slice(0, 2).map((item) => item.id);
        setSelectedSwimmers(initialIds);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const firstSwimmer = swimmers.find((item) => item.id === selectedSwimmers[0]);
    if (!firstSwimmer) {
      return;
    }

    listPublicSwimmerEvents(firstSwimmer.slug).then((response) => {
      setEvents(response.events);
      setSelectedEventId((current) => current || response.events[0]?.event.id || "");
    });
  }, [selectedSwimmers, swimmers]);

  useEffect(() => {
    if (!selectedEventId || selectedSwimmers.length === 0) {
      return;
    }

    comparePublicEvent(selectedEventId, selectedSwimmers).then(setComparePayload);
  }, [selectedEventId, selectedSwimmers]);

  function toggleSwimmer(swimmerId: string) {
    setSelectedSwimmers((current) =>
      current.includes(swimmerId)
        ? current.filter((item) => item !== swimmerId)
        : [...current, swimmerId].slice(0, 4),
    );
  }

  return (
    <PublicShell className="gap-6">
      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
              Compare Setup
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-primary">
              同项目进步对比
            </h1>
          </div>

          {loading ? (
            <LoadingState label="加载孩子列表" />
          ) : (
            <>
              <div className="space-y-2">
                {swimmers.map((swimmer) => {
                  const active = selectedSwimmers.includes(swimmer.id);
                  return (
                    <button
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-primary/10 bg-white text-primary hover:bg-primary/6"
                      }`}
                      key={swimmer.id}
                      onClick={() => toggleSwimmer(swimmer.id)}
                      type="button"
                    >
                      {describeSwimmer(swimmer)}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-primary">
                  对比项目
                </label>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary"
                  onChange={(event) => setSelectedEventId(event.target.value)}
                  value={selectedEventId}
                >
                  {events.map((item) => (
                    <option key={item.event.id} value={item.event.id}>
                      {item.event.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (selectedEventId && selectedSwimmers.length > 0) {
                    comparePublicEvent(selectedEventId, selectedSwimmers).then(setComparePayload);
                  }
                }}
                variant="secondary"
              >
                刷新对比
              </Button>
            </>
          )}
        </Card>

        <div className="space-y-4">
          {comparePayload ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {comparePayload.swimmers.map((swimmer) => (
                  <MetricCard
                    caption={`相对提升 ${(swimmer.improvementRatio * 100).toFixed(1)}%`}
                    key={swimmer.swimmerId}
                    label={describeSwimmer(swimmer)}
                    value={formatTimeMS(swimmer.currentBestTimeMs)}
                  />
                ))}
              </section>
              <CompareChart swimmers={comparePayload.swimmers} />
            </>
          ) : (
            <LoadingState label="对比结果" />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
