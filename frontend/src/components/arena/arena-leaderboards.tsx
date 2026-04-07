"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import type { ArenaGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

function genderLabel(gender: ArenaGroup["gender"]) {
  if (gender === "male") return "男子";
  if (gender === "female") return "女子";
  return "男女混合";
}

function ageBucketLabel(ageBucket: string) {
  switch (ageBucket) {
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
      return "不分年龄";
  }
}

export function ArenaLeaderboards({
  groups,
  selectedGroupKey,
  onSelectGroup,
}: {
  groups: ArenaGroup[];
  selectedGroupKey: string;
  onSelectGroup: (groupKey: string) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-[32px] border border-dashed border-border/60 bg-surface/30 text-sm font-medium text-muted">
        当前筛选条件下暂无可切换的赛道分组
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {groups.map((group) => {
        const selected = selectedGroupKey === group.groupKey;
        return (
          <button
            aria-pressed={selected}
            className="block w-full text-left"
            key={group.groupKey}
            onClick={() => onSelectGroup(group.groupKey)}
            type="button"
          >
            <Card
              className={cn(
                "overflow-hidden border-border/40 transition-all hover:border-primary/25 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5",
                selected && "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10",
              )}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
                    {genderLabel(group.gender)}
                  </Badge>
                  <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
                    {ageBucketLabel(group.ageBucket)}
                  </Badge>
                  <Badge className="rounded-full px-3 py-1 text-[10px] font-bold" variant="outline">
                    {group.heatLabel}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-base font-black tracking-tight text-foreground">
                    {group.event.displayName}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-primary">
                      头名 {group.leader.displayName} · {formatTimeMS(group.leader.bestTimeMs)}
                    </span>
                    <span className="text-muted">
                      {group.competitorCount} 人上榜 · 优势 {formatTimeMS(group.leaderGapMs)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
