"use client";

import {
  ResponsiveContainer,
  Tooltip,
  Treemap,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import type { ArenaGroup } from "@/lib/types";
import { formatTimeMS } from "@/lib/format";

type ArenaTreemapNode = ArenaGroup & {
  size: number;
};

function arenaGenderLabel(gender: ArenaGroup["gender"]) {
  return gender === "male" ? "男子" : "女子";
}

function heatPalette(heatScore: number) {
  if (heatScore >= 80) {
    return { fill: "#312e81", stroke: "#4338ca", text: "#ffffff" };
  }
  if (heatScore >= 65) {
    return { fill: "#4338ca", stroke: "#4f46e5", text: "#ffffff" };
  }
  if (heatScore >= 50) {
    return { fill: "#6366f1", stroke: "#4f46e5", text: "#ffffff" };
  }
  if (heatScore >= 35) {
    return { fill: "#c7d2fe", stroke: "#818cf8", text: "#312e81" };
  }
  return { fill: "#e2e8f0", stroke: "#cbd5e1", text: "#334155" };
}

function ArenaTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ArenaTreemapNode }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const group = payload[0].payload;
  return (
    <div className="rounded-3xl border border-border/60 bg-surface-strong/95 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full px-2 py-0 text-[10px] font-bold" variant="outline">
            {arenaGenderLabel(group.gender)}
          </Badge>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/60">
            {group.heatLabel}
          </span>
        </div>
        <div className="text-sm font-black text-foreground">{group.event.displayName}</div>
        <div className="text-xs text-muted">
          头名 {group.leader.displayName} · {formatTimeMS(group.leader.bestTimeMs)}
        </div>
        <div className="text-xs text-muted">
          竞争人数 {group.competitorCount} · 头名优势 {formatTimeMS(group.leaderGapMs)}
        </div>
      </div>
    </div>
  );
}

function ArenaTile({
  depth,
  x,
  y,
  width,
  height,
  payload,
  selectedGroupKey,
  onSelectGroup,
}: {
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ArenaTreemapNode;
  selectedGroupKey: string;
  onSelectGroup: (groupKey: string) => void;
}) {
  if (
    depth === undefined
    || !payload
    || !("event" in payload)
    || x === undefined
    || y === undefined
    || width === undefined
    || height === undefined
  ) {
    return null;
  }

  const palette = heatPalette(payload.heatScore);
  const selected = payload.groupKey === selectedGroupKey;
  const compact = width < 160 || height < 110;

  return (
    <g onClick={() => onSelectGroup(payload.groupKey)} style={{ cursor: "pointer" }}>
      <rect
        fill={palette.fill}
        height={height}
        rx={24}
        ry={24}
        stroke={selected ? "#f59e0b" : palette.stroke}
        strokeWidth={selected ? 3 : 1.5}
        width={width}
        x={x}
        y={y}
      />
      <foreignObject height={height} width={width} x={x} y={y}>
        <button
          aria-label={`${payload.event.displayName} ${arenaGenderLabel(payload.gender)} 赛道`}
          className="flex h-full w-full flex-col justify-between p-3 text-left"
          onClick={() => onSelectGroup(payload.groupKey)}
          type="button"
        >
          <div className="space-y-1">
            <div
              className="text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: palette.text, opacity: 0.85 }}
            >
              {arenaGenderLabel(payload.gender)}
            </div>
            <div
              className="line-clamp-2 text-sm font-black leading-tight"
              style={{ color: palette.text }}
            >
              {payload.event.displayName}
            </div>
          </div>

          {!compact ? (
            <div className="space-y-1">
              <div className="text-[10px] font-bold" style={{ color: palette.text, opacity: 0.8 }}>
                头名 {payload.leader.displayName}
              </div>
              <div className="text-lg font-black tracking-tight" style={{ color: palette.text }}>
                {formatTimeMS(payload.leader.bestTimeMs)}
              </div>
              <div className="text-[10px] font-bold" style={{ color: palette.text, opacity: 0.8 }}>
                {payload.competitorCount} 人参赛 · {payload.heatLabel}
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-bold" style={{ color: palette.text, opacity: 0.8 }}>
              {payload.leader.displayName}
            </div>
          )}
        </button>
      </foreignObject>
    </g>
  );
}

export function ArenaHeatmap({
  groups,
  selectedGroupKey,
  onSelectGroup,
}: {
  groups: ArenaGroup[];
  selectedGroupKey: string;
  onSelectGroup: (groupKey: string) => void;
}) {
  const data: ArenaTreemapNode[] = groups.map((group) => ({
    ...group,
    size: Math.max(group.competitorCount, 1),
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[380px] items-center justify-center rounded-[32px] border border-dashed border-border/60 bg-surface/30 text-sm font-medium text-muted">
        当前筛选条件下暂无可展示的竞技场赛道
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full min-w-0 md:h-[520px]">
      <ResponsiveContainer height="100%" minHeight={360} width="100%">
        <Treemap
          animationDuration={500}
          content={(props) => (
            <ArenaTile
              {...props}
              onSelectGroup={onSelectGroup}
              selectedGroupKey={selectedGroupKey}
            />
          )}
          data={data}
          dataKey="size"
          isAnimationActive
          stroke="#ffffff"
        >
          <Tooltip content={<ArenaTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
