"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Flame,
  Swords,
  Users,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

import { ArenaHeatmap } from "@/components/arena/arena-heatmap";
import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { SelectField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicArena, listPublicSwimmers } from "@/lib/api/public";
import { formatTimeMS } from "@/lib/format";
import type { ArenaGroup, ArenaPayload, PublicSwimmerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

function genderLabel(gender: "male" | "female" | "all") {
  if (gender === "male") return "男子";
  if (gender === "female") return "女子";
  return "全部";
}

function arenaGenderLabel(gender: ArenaGroup["gender"]) {
  return gender === "male" ? "男子" : "女子";
}

export function ArenaPage() {
  const [swimmers, setSwimmers] = useState<PublicSwimmerSummary[]>([]);
  const [arenaPayload, setArenaPayload] = useState<ArenaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [filters, setFilters] = useState<{
    gender: "male" | "female" | "all";
    poolLengthM: "all" | "25" | "50";
    teamId: string;
  }>({
    gender: "all",
    poolLengthM: "all",
    teamId: "all",
  });

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => setSwimmers(response.swimmers))
      .catch((error: Error) => toast.error(error.message));
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getPublicArena({
      gender: filters.gender === "all" ? undefined : filters.gender,
      poolLengthM: filters.poolLengthM === "all" ? undefined : Number(filters.poolLengthM),
      teamId: filters.teamId === "all" ? undefined : filters.teamId,
    })
      .then((response) => {
        if (cancelled) {
          return;
        }
        setArenaPayload(response);
        setSelectedGroupKey((current) => {
          if (response.groups.some((group) => group.groupKey === current)) {
            return current;
          }
          return response.groups[0]?.groupKey ?? "";
        });
      })
      .catch((error: Error) => {
        if (!cancelled) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const teams = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>();
    swimmers.forEach((swimmer) => {
      map.set(swimmer.teamId, { value: swimmer.teamId, label: swimmer.team.name });
    });
    return [{ value: "all", label: "全部队伍" }, ...Array.from(map.values())];
  }, [swimmers]);

  const selectedGroup = useMemo(
    () => arenaPayload?.groups.find((group) => group.groupKey === selectedGroupKey) ?? null,
    [arenaPayload, selectedGroupKey],
  );

  const hottestGroup = arenaPayload?.groups[0] ?? null;

  return (
    <PublicShell className="gap-8">
      <section className="flex flex-col gap-4 border-b border-border/40 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" variant="solid">
            Arena Market
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-foreground">竞技场</h1>
            <p className="max-w-3xl text-sm font-medium text-muted">
              像看市场热力图一样看公开赛道竞争。每一个热力块都只代表一个
              同项目、同池长、同性别的真实竞技场。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "male", "female"] as const).map((gender) => (
            <Button
              className="rounded-full"
              key={gender}
              onClick={() => {
                setLoading(true);
                setFilters((current) => ({ ...current, gender }));
              }}
              size="sm"
              type="button"
              variant={filters.gender === gender ? "primary" : "outline"}
            >
              {genderLabel(gender)}
            </Button>
          ))}
          {(["all", "25", "50"] as const).map((poolLengthM) => (
            <Button
              className="rounded-full"
              key={poolLengthM}
              onClick={() => {
                setLoading(true);
                setFilters((current) => ({ ...current, poolLengthM }));
              }}
              size="sm"
              type="button"
              variant={filters.poolLengthM === poolLengthM ? "secondary" : "outline"}
            >
              {poolLengthM === "all" ? "全部池长" : `${poolLengthM}m`}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<Swords className="h-5 w-5" />}
              label="赛道数量"
              value={arenaPayload ? `${arenaPayload.summary.arenaCount}` : "--"}
            />
            <SummaryCard
              icon={<Users className="h-5 w-5" />}
              label="有效竞争人数"
              value={arenaPayload ? `${arenaPayload.summary.competitorCount}` : "--"}
            />
            <SummaryCard
              icon={<Waves className="h-5 w-5" />}
              label="当前筛选"
              value={`${genderLabel(filters.gender)} · ${filters.poolLengthM === "all" ? "全部池长" : `${filters.poolLengthM}m`}`}
            />
            <SummaryCard
              icon={<Flame className="h-5 w-5" />}
              label="最热赛道"
              value={hottestGroup ? hottestGroup.event.displayName : "暂无"}
            />
          </div>

          <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-surface/30">
              <CardTitle className="text-xl">赛道热力板</CardTitle>
              <CardDescription>
                面积表示有效竞争人数，颜色表示赛道热度。点击任一赛道查看详细榜单。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <SelectField
                className="max-w-xs"
                label="队伍筛选"
                onChange={(teamId) => {
                  setLoading(true);
                  setFilters((current) => ({ ...current, teamId }));
                }}
                options={teams}
                value={filters.teamId}
              />

              {loading ? (
                <LoadingState label="竞技场热力板加载中" />
              ) : (
                <ArenaHeatmap
                  groups={arenaPayload?.groups ?? []}
                  onSelectGroup={setSelectedGroupKey}
                  selectedGroupKey={selectedGroupKey}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-surface/30">
              <CardTitle className="text-xl">赛道详情</CardTitle>
              <CardDescription>
                点击热力板中的赛道后，在这里查看当前赛道的头名和排行榜。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {selectedGroup ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
                        {arenaGenderLabel(selectedGroup.gender)}
                      </Badge>
                      <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
                        {selectedGroup.heatLabel}
                      </Badge>
                    </div>
                    <div className="text-2xl font-black tracking-tight text-foreground">
                      {selectedGroup.event.displayName}
                    </div>
                    <p className="text-sm text-muted">
                      当前头名 {selectedGroup.leader.displayName}，最佳成绩{" "}
                      {formatTimeMS(selectedGroup.leader.bestTimeMs)}。
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <DetailMetric
                      label="竞争人数"
                      value={`${selectedGroup.competitorCount}`}
                    />
                    <DetailMetric
                      label="头名优势"
                      value={formatTimeMS(selectedGroup.leaderGapMs)}
                    />
                    <DetailMetric
                      label="优势比例"
                      value={`${(selectedGroup.leaderGapPercent * 100).toFixed(1)}%`}
                    />
                  </div>

                  <div className="space-y-3">
                    {selectedGroup.rankings.map((entry) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-[24px] border border-border/40 bg-white p-4 transition-all",
                          entry.rank === 1 && "border-primary/30 bg-primary/5",
                        )}
                        initial={{ opacity: 0, y: 8 }}
                        key={entry.swimmerId}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-sm font-black text-foreground">
                            {entry.rank}
                          </div>
                          <div>
                            <div className="text-sm font-black text-foreground">
                              {entry.displayName}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                              {entry.team.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-primary">
                            {formatTimeMS(entry.bestTimeMs)}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                            落后 {formatTimeMS(entry.gapFromLeaderMs)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-border/60 bg-surface/30 text-center">
                  <div className="space-y-2 px-6">
                    <div className="text-xl font-black text-foreground">暂无赛道详情</div>
                    <p className="text-sm text-muted">
                      当前筛选条件下没有可展示的竞技场赛道，请切换筛选条件后再查看。
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
            {label}
          </div>
          <div className="text-lg font-black text-foreground">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/40 bg-surface/40 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-foreground">{value}</div>
    </div>
  );
}
