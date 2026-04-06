"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Flame, Medal, Waves, Users } from "lucide-react";
import { toast } from "sonner";

import { ArenaLeaderboards } from "@/components/arena/arena-leaderboards";
import { PublicShell } from "@/components/layout/public-shell";
import { SelectField } from "@/components/shared/form-field";
import { LoadingState } from "@/components/shared/loading-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicArena } from "@/lib/api/public";
import { formatTimeMS } from "@/lib/format";
import type { ArenaGroup, ArenaPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

function genderLabel(gender: "male" | "female" | "all") {
  if (gender === "male") return "男子";
  if (gender === "female") return "女子";
  return "全部";
}

function arenaGenderLabel(gender: ArenaGroup["gender"]) {
  if (gender === "male") return "男子";
  if (gender === "female") return "女子";
  return "男女混合";
}

function strokeLabel(stroke: string) {
  switch (stroke) {
    case "freestyle":
      return "自由泳";
    case "backstroke":
      return "仰泳";
    case "breaststroke":
      return "蛙泳";
    case "butterfly":
      return "蝶泳";
    case "medley":
      return "混合泳";
    default:
      return "未知泳姿";
  }
}

function ageBucketLabel(ageBucket?: string) {
  switch (ageBucket) {
    case "all":
      return "不分年龄";
    case "u8":
      return "U8";
    case "u9":
      return "U9";
    case "u10":
      return "U10";
    case "u11":
      return "U11";
    case "u12":
      return "U12";
    case "u13":
      return "U13";
    case "u14":
      return "U14";
    case "u15":
      return "U15";
    case "u16_plus":
      return "U16+";
    default:
      return "未知年龄";
  }
}

export function ArenaPage() {
  const [arenaPayload, setArenaPayload] = useState<ArenaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [filters, setFilters] = useState<{
    gender: "male" | "female" | "all";
    poolLengthM: "all" | "25" | "50";
    projectKey: string;
  }>({
    gender: "all",
    poolLengthM: "all",
    projectKey: "all",
  });

  useEffect(() => {
    let cancelled = false;

    void getPublicArena({
      gender: filters.gender === "all" ? undefined : filters.gender,
      poolLengthM:
        filters.poolLengthM === "all" ? undefined : Number(filters.poolLengthM),
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
  }, [filters.gender, filters.poolLengthM]);

  const projectOptions = useMemo(() => {
    const groups = arenaPayload?.groups ?? [];
    const map = new Map<string, { value: string; label: string }>();
    groups.forEach((group) => {
      const key = `${group.event.distanceM}:${group.event.stroke}`;
      if (!map.has(key)) {
        map.set(key, {
          value: key,
          label: `${group.event.distanceM}米 ${strokeLabel(group.event.stroke)}`,
        });
      }
    });
    return [{ value: "all", label: "全部项目" }, ...Array.from(map.values())];
  }, [arenaPayload]);

  const filteredGroups = useMemo(() => {
    const groups = arenaPayload?.groups ?? [];
    if (filters.projectKey === "all") {
      return groups;
    }

    return groups.filter((group) => {
      const projectKey = `${group.event.distanceM}:${group.event.stroke}`;
      return projectKey === filters.projectKey;
    });
  }, [arenaPayload, filters.projectKey]);

  const effectiveSelectedGroupKey = useMemo(() => {
    if (filteredGroups.some((group) => group.groupKey === selectedGroupKey)) {
      return selectedGroupKey;
    }

    return filteredGroups[0]?.groupKey ?? "";
  }, [filteredGroups, selectedGroupKey]);

  const selectedGroup = useMemo(
    () =>
      filteredGroups.find((group) => group.groupKey === effectiveSelectedGroupKey)
      ?? null,
    [effectiveSelectedGroupKey, filteredGroups],
  );

  const selectedProjectLabel = useMemo(
    () =>
      projectOptions.find((option) => option.value === filters.projectKey)?.label
      ?? "全部项目",
    [filters.projectKey, projectOptions],
  );

  const filteredCompetitorCount = useMemo(
    () => filteredGroups.reduce((sum, group) => sum + group.competitorCount, 0),
    [filteredGroups],
  );

  return (
    <PublicShell className="gap-8">
      <section className="space-y-6 border-b border-border/40 pb-8">
        <div className="space-y-3">
          <Badge
            className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            variant="solid"
          >
            Arena Market
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              竞技场
            </h1>
            <p className="max-w-3xl text-sm font-medium text-muted">
              直接看同项目、同池长、同性别边界内的赛道竞争。三项筛选共同作用在赛道切换区与主详情面板，
              让家长和教练更快锁定当前最值得看的分组。
            </p>
          </div>
        </div>

        <Card className="border-border/40 bg-surface/40 shadow-sm">
          <CardHeader className="gap-1 border-b border-border/40 bg-surface/20 pb-4">
            <CardTitle className="text-base font-black tracking-tight">
              筛选竞技维度
            </CardTitle>
            <CardDescription>
              按性别、池长、项目三项共同筛选，赛道切换区和详情区会同步刷新。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <SelectField
              label="性别筛选"
              onChange={(gender) => {
                setLoading(true);
                setFilters((current) => ({
                  ...current,
                  gender: gender as "male" | "female" | "all",
                  projectKey: "all",
                }));
              }}
              options={[
                { value: "all", label: "全部性别" },
                { value: "male", label: "男子" },
                { value: "female", label: "女子" },
              ]}
              value={filters.gender}
            />
            <SelectField
              label="池长筛选"
              onChange={(poolLengthM) => {
                setLoading(true);
                setFilters((current) => ({
                  ...current,
                  poolLengthM: poolLengthM as "all" | "25" | "50",
                  projectKey: "all",
                }));
              }}
              options={[
                { value: "all", label: "全部池长" },
                { value: "25", label: "25米短池" },
                { value: "50", label: "50米长池" },
              ]}
              value={filters.poolLengthM}
            />
            <SelectField
              label="项目筛选"
              onChange={(projectKey) =>
                setFilters((current) => ({ ...current, projectKey }))
              }
              options={projectOptions}
              value={filters.projectKey}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Medal className="h-5 w-5" />}
            label="榜单分组"
            value={arenaPayload ? `${filteredGroups.length}` : "--"}
          />
          <SummaryCard
            icon={<Users className="h-5 w-5" />}
            label="有效竞争人数"
            value={arenaPayload ? `${filteredCompetitorCount}` : "--"}
          />
          <SummaryCard
            icon={<Waves className="h-5 w-5" />}
            label="当前筛选"
            value={`${genderLabel(filters.gender)} · ${filters.poolLengthM === "all" ? "全部池长" : `${filters.poolLengthM}米`} · ${selectedProjectLabel}`}
          />
          <SummaryCard
            icon={<Flame className="h-5 w-5" />}
            label="当前赛道热度"
            value={
              selectedGroup
                ? `${selectedGroup.heatLabel} · ${selectedGroup.heatScore}分`
                : "暂无"
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-surface/30">
              <CardTitle className="text-xl">赛道切换</CardTitle>
              <CardDescription>
                这里负责切换当前要看的赛道分组，详细竞争信息统一在右侧展开。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <LoadingState label="赛道分组加载中" />
              ) : (
                <ArenaLeaderboards
                  groups={filteredGroups}
                  onSelectGroup={setSelectedGroupKey}
                  selectedGroupKey={effectiveSelectedGroupKey}
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-surface/30">
              <CardTitle className="text-xl">赛道详情</CardTitle>
              <CardDescription>
                当前选中赛道的头名、热度、优势差距与完整排行都集中展示在这里。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {loading ? (
                <LoadingState label="赛道详情加载中" />
              ) : selectedGroup ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className="rounded-full px-3 py-1 text-[10px] font-bold"
                        variant="outline"
                      >
                        {arenaGenderLabel(selectedGroup.gender)}
                      </Badge>
                      <Badge
                        className="rounded-full px-3 py-1 text-[10px] font-bold"
                        variant="outline"
                      >
                        {ageBucketLabel(selectedGroup.ageBucket)}
                      </Badge>
                      <Badge
                        className="rounded-full px-3 py-1 text-[10px] font-bold"
                        variant="outline"
                      >
                        {selectedGroup.heatLabel}
                      </Badge>
                    </div>
                    <div className="text-2xl font-black tracking-tight text-foreground">
                      {selectedGroup.event.displayName}
                    </div>
                    <p className="text-sm text-muted">
                      当前头名 {selectedGroup.leader.displayName}，最佳成绩{" "}
                      {formatTimeMS(selectedGroup.leader.bestTimeMs)}，这条赛道当前共有{" "}
                      {selectedGroup.competitorCount} 位公开选手进入榜单。
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailMetric
                      label="竞争人数"
                      value={`${selectedGroup.competitorCount}`}
                    />
                    <DetailMetric
                      label="热度等级"
                      value={selectedGroup.heatLabel}
                    />
                    <DetailMetric
                      label="热度分数"
                      value={`${selectedGroup.heatScore}`}
                    />
                    <DetailMetric
                      label="头名优势"
                      value={formatTimeMS(selectedGroup.leaderGapMs)}
                    />
                  </div>

                  <div className="rounded-[28px] border border-border/40 bg-surface/30 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                          当前头名
                        </div>
                        <div className="text-2xl font-black tracking-tight text-foreground">
                          {selectedGroup.leader.displayName}
                        </div>
                        <div className="text-sm font-semibold text-muted">
                          {selectedGroup.leader.team.name}
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted/50">
                          最佳成绩
                        </div>
                        <div className="text-3xl font-black tracking-tight text-primary">
                          {formatTimeMS(selectedGroup.leader.bestTimeMs)}
                        </div>
                        <div className="text-sm font-semibold text-muted">
                          领先比例{" "}
                          {(selectedGroup.leaderGapPercent * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
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
                    <div className="text-xl font-black text-foreground">
                      暂无赛道详情
                    </div>
                    <p className="text-sm text-muted">
                      当前筛选条件下没有可展示的竞技场榜单，请切换筛选条件后再查看。
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
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
