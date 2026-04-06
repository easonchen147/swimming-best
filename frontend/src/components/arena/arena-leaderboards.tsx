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
    case "u10":
      return "U10";
    case "u12":
      return "U12";
    case "u14":
      return "U14";
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
        当前筛选条件下暂无可展示的竞技场排行榜
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((group) => {
        const selected = selectedGroupKey === group.groupKey;
        return (
          <button
            className="text-left"
            key={group.groupKey}
            onClick={() => onSelectGroup(group.groupKey)}
            type="button"
          >
            <Card
              className={cn(
                "overflow-hidden border-border/40 transition-all hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5",
                selected && "border-primary/30 shadow-lg shadow-primary/10",
              )}
            >
              <CardContent className="space-y-5 p-6">
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

                <div className="space-y-1">
                  <div className="text-lg font-black tracking-tight text-foreground">
                    {group.event.displayName}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted/50">
                    {group.competitorCount} 人上榜
                  </div>
                </div>

                <div className="grid gap-3">
                  {group.rankings.slice(0, 3).map((entry) => (
                    <div
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-[20px] border border-border/40 bg-surface/40 px-4 py-3",
                        entry.rank === 1 && "border-primary/25 bg-primary/5",
                      )}
                      key={entry.swimmerId}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sm font-black text-foreground shadow-sm">
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
                          差 {formatTimeMS(entry.gapFromLeaderMs)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
