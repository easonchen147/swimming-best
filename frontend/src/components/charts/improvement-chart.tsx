"use client";

import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";
import type { BenchmarkLine, GoalProgress, OfficialBenchmark } from "@/lib/types";

type RawPoint = {
  performedOn: string;
  timeMs: number;
  sourceType?: string;
};

type PbPoint = {
  performedOn: string;
  timeMs: number;
};

type ReferenceBenchmark = {
  id: string;
  label: string;
  qualifyingTimeMs: number;
  colorHex: string;
  source: "official" | "goal" | "custom";
  strokeDasharray: string;
};

const officialPalette = ["#f59e0b", "#fb7185", "#ef4444", "#7c3aed"];

function goalColor(horizon: string) {
  if (horizon === "short") return "#10b981";
  if (horizon === "mid") return "#0ea5e9";
  return "#8b5cf6";
}

function sourceGroupLabel(source: ReferenceBenchmark["source"]) {
  if (source === "official") return "国家达级";
  if (source === "goal") return "公开目标";
  return "自定义标准";
}

function sourceTypeLabel(sourceType?: string) {
  if (sourceType === "competition") return "比赛";
  if (sourceType === "training") return "训练";
  if (sourceType === "test") return "测试";
  return "单次录入";
}

function buildReferenceBenchmarks({
  benchmarkLines,
  goals,
  officialBenchmarks,
}: {
  benchmarkLines: BenchmarkLine[];
  goals: GoalProgress[];
  officialBenchmarks: OfficialBenchmark[];
}) {
  const official = officialBenchmarks.map((benchmark, index) => ({
    id: `official-${benchmark.code}-${benchmark.qualifyingTimeMs}`,
    label: benchmark.label,
    qualifyingTimeMs: benchmark.qualifyingTimeMs,
    colorHex: officialPalette[index % officialPalette.length],
    source: "official" as const,
    strokeDasharray: benchmark.achieved ? "4 3" : "7 5",
  }));

  const goalLines = goals.map((goal) => ({
    id: `goal-${goal.id}`,
    label: goal.title,
    qualifyingTimeMs: goal.targetTimeMs,
    colorHex: goalColor(goal.horizon),
    source: "goal" as const,
    strokeDasharray: goal.isAchieved ? "3 3" : "8 4",
  }));

  const custom = benchmarkLines.map((line) => ({
    id: `custom-${line.tierGroup}-${line.name}-${line.qualifyingTimeMs}`,
    label: line.name,
    qualifyingTimeMs: line.qualifyingTimeMs,
    colorHex: line.colorHex,
    source: "custom" as const,
    strokeDasharray: "4 4",
  }));

  return [...official, ...goalLines, ...custom];
}

function buildDomain(raw: RawPoint[], referenceBenchmarks: ReferenceBenchmark[]) {
  const values = [
    ...raw.map((point) => point.timeMs),
    ...referenceBenchmarks.map((item) => item.qualifyingTimeMs),
  ];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(Math.round((max - min) * 0.08), 300);
  return [Math.max(min - pad, 0), max + pad];
}

function groupReferenceBenchmarks(referenceBenchmarks: ReferenceBenchmark[]) {
  return {
    official: referenceBenchmarks.filter((item) => item.source === "official"),
    goal: referenceBenchmarks.filter((item) => item.source === "goal"),
    custom: referenceBenchmarks.filter((item) => item.source === "custom"),
  };
}

export function ImprovementChart({
  raw,
  pb = [],
  benchmarkLines = [],
  goals = [],
  officialBenchmarks = [],
}: {
  raw: RawPoint[];
  pb?: PbPoint[];
  benchmarkLines?: BenchmarkLine[];
  goals?: GoalProgress[];
  officialBenchmarks?: OfficialBenchmark[];
}) {
  if (raw.length === 0) {
    return (
      <Card className="border-border/40">
        <div className="py-8 text-center text-sm text-muted">暂无成绩数据</div>
      </Card>
    );
  }

  const pbSet = new Set<string>();
  let currentBest = Number.POSITIVE_INFINITY;

  for (const point of raw) {
    if (point.timeMs < currentBest) {
      currentBest = point.timeMs;
      pbSet.add(`${point.performedOn}-${point.timeMs}`);
    }
  }

  const chartData = raw.map((point, index) => {
    const previousTimeMs = index > 0 ? raw[index - 1].timeMs : null;
    return {
      date: point.performedOn,
      timeMs: point.timeMs,
      pbTimeMs: pb[index]?.timeMs ?? point.timeMs,
      changeFromPreviousMs:
        previousTimeMs === null ? 0 : previousTimeMs - point.timeMs,
      sourceType: point.sourceType,
      isPb: pbSet.has(`${point.performedOn}-${point.timeMs}`),
    };
  });

  const referenceBenchmarks = buildReferenceBenchmarks({
    benchmarkLines,
    goals,
    officialBenchmarks,
  });
  const groupedReferenceBenchmarks = groupReferenceBenchmarks(referenceBenchmarks);
  const yDomain = buildDomain(raw, referenceBenchmarks);

  return (
    <Card className="min-w-0 border-border/40 p-5 shadow-xl shadow-primary/5 md:p-6">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-primary">成长曲线</h3>
          <Badge className="rounded-full text-[10px]" variant="outline">
            越往上越快
          </Badge>
        </div>
        <p className="text-xs text-muted">
          同一张图里同时查看真实成绩、PB 走势、国家达级线、公开目标线和自定义标准线。
        </p>
      </div>

      <div className="h-[320px] min-w-0 w-full md:h-[380px]">
        <ResponsiveContainer height="100%" minHeight={320} minWidth={0} width="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid
              stroke="rgba(15,23,42,0.06)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={yDomain}
              reversed
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) {
                  return null;
                }

                const item = payload[0].payload;
                const deltaLabel =
                  item.changeFromPreviousMs === 0
                    ? "首条记录"
                    : item.changeFromPreviousMs > 0
                      ? `比上次快 ${formatTimeMS(item.changeFromPreviousMs)}`
                      : `比上次慢 ${formatTimeMS(Math.abs(item.changeFromPreviousMs))}`;

                return (
                  <div className="rounded-2xl border border-primary/10 bg-white px-3 py-2 text-xs shadow-md">
                    <div className="font-semibold text-primary">{item.date}</div>
                    <div className="mt-1 text-muted">成绩: {formatTimeMS(item.timeMs)}</div>
                    <div className="mt-0.5 text-muted">
                      记录类型: {sourceTypeLabel(item.sourceType)}
                    </div>
                    <div className="mt-0.5 font-semibold text-slate-700">{deltaLabel}</div>
                    {item.isPb ? (
                      <div className="mt-0.5 font-semibold text-amber-500">PB</div>
                    ) : null}
                  </div>
                );
              }}
            />

            {referenceBenchmarks.map((line) => (
              <ReferenceLine
                key={line.id}
                stroke={line.colorHex}
                strokeDasharray={line.strokeDasharray}
                strokeOpacity={0.8}
                y={line.qualifyingTimeMs}
              />
            ))}

            <Line
              dataKey="pbTimeMs"
              dot={false}
              isAnimationActive={false}
              name="PB"
              stroke="#f59e0b"
              strokeDasharray="6 4"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="timeMs"
              dot={({ cx, cy, payload }) => (
                <Dot
                  cx={cx}
                  cy={cy}
                  fill={payload.isPb ? "#f59e0b" : "#0f172a"}
                  r={payload.isPb ? 5 : 3.5}
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
              isAnimationActive={false}
              name="成绩"
              stroke="#0f172a"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {(["official", "goal", "custom"] as const).map((source) => {
          const items = groupedReferenceBenchmarks[source];
          if (items.length === 0) {
            return null;
          }

          return (
            <div className="space-y-2" key={source}>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/50">
                {sourceGroupLabel(source)}
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-foreground"
                    key={item.id}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <span>{item.label}</span>
                    <span className="text-muted">{formatTimeMS(item.qualifyingTimeMs)}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
