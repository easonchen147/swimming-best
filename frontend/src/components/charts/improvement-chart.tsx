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
import { AnimatedChart } from "./animated-chart";
import { ChartTooltip } from "./chart-tooltip";

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
    <AnimatedChart>
      <Card className="min-w-0 border-border/40 p-6 shadow-xl shadow-primary/5 md:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">成长曲线</h3>
            <Badge className="rounded-full border-primary/20 bg-primary/5 text-[10px] font-bold text-primary" variant="outline">
              越往上越快
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted/80 leading-relaxed">
            同一张图里同时查看真实成绩、PB 走势、国家达级线、公开目标线和自定义标准线。
          </p>
        </div>

        <div className="h-[320px] min-w-0 w-full md:h-[420px]">
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
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                axisLine={false}
                domain={yDomain}
                reversed
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                tickLine={false}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip title="Growth Detail" />}
                cursor={{ stroke: "rgba(79, 70, 229, 0.1)", strokeWidth: 2 }}
              />

              {referenceBenchmarks.map((line) => (
                <ReferenceLine
                  key={line.id}
                  stroke={line.colorHex}
                  strokeDasharray={line.strokeDasharray}
                  strokeOpacity={0.8}
                  strokeWidth={1.5}
                  y={line.qualifyingTimeMs}
                />
              ))}

              <Line
                dataKey="pbTimeMs"
                dot={false}
                isAnimationActive={true}
                animationDuration={2000}
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
                    fill={payload.isPb ? "#f59e0b" : "#4F46E5"}
                    r={payload.isPb ? 6 : 4}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )}
                isAnimationActive={true}
                animationDuration={1500}
                name="成绩"
                stroke="#4F46E5"
                strokeWidth={4}
                type="monotone"
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 space-y-4">
          {(["official", "goal", "custom"] as const).map((source) => {
            const items = groupedReferenceBenchmarks[source];
            if (items.length === 0) {
              return null;
            }

            return (
              <div className="space-y-3" key={source}>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
                  {sourceGroupLabel(source)}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {items.map((item) => (
                    <span
                      className="inline-flex items-center gap-2.5 rounded-2xl border border-border/40 bg-surface/50 px-4 py-2 text-xs font-bold text-foreground transition-all hover:border-primary/20 hover:bg-surface"
                      key={item.id}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span>{item.label}</span>
                      <span className="font-mono font-black text-primary/80">{formatTimeMS(item.qualifyingTimeMs)}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </AnimatedChart>
  );
}
