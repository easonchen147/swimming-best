"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";

type RawPoint = {
  performedOn: string;
  timeMs: number;
  sourceType?: string;
};

type PbPoint = {
  performedOn: string;
  timeMs: number;
};

export function ImprovementChart({
  raw,
  pb,
}: {
  raw: RawPoint[];
  pb: PbPoint[];
}) {
  if (raw.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center text-sm text-muted">
          暂无成绩数据
        </div>
      </Card>
    );
  }

  const firstTime = raw[0].timeMs;
  const pbSet = new Set<string>();
  let currentBest = Infinity;

  for (const point of raw) {
    if (point.timeMs < currentBest) {
      currentBest = point.timeMs;
      pbSet.add(`${point.performedOn}-${point.timeMs}`);
    }
  }

  const data = raw.map((point) => {
    const deltaMs = firstTime - point.timeMs;
    const isPb = pbSet.has(`${point.performedOn}-${point.timeMs}`);
    return {
      date: point.performedOn,
      deltaMs,
      deltaLabel: deltaMs > 0 ? `-${(deltaMs / 1000).toFixed(2)}s` : deltaMs < 0 ? `+${(Math.abs(deltaMs) / 1000).toFixed(2)}s` : "0s",
      timeMs: point.timeMs,
      isPb,
    };
  });

  return (
    <Card className="h-[360px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">
          进步幅度
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          每次成绩相对首次记录的提升（负值 = 更快）
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(15,23,42,0.06)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const item = payload[0].payload;
              return (
                <div className="rounded-xl border border-primary/10 bg-white px-3 py-2 text-xs shadow-md">
                  <div className="font-semibold text-primary">{item.date}</div>
                  <div className="mt-1 text-muted">成绩: {formatTimeMS(item.timeMs)}</div>
                  <div className="mt-0.5 font-semibold" style={{ color: item.deltaMs >= 0 ? "#0ea5e9" : "#ef4444" }}>
                    {item.deltaLabel}
                  </div>
                  {item.isPb && <div className="mt-0.5 font-semibold text-amber-500">PB</div>}
                </div>
              );
            }}
          />
          <ReferenceLine y={0} stroke="rgba(15,23,42,0.15)" />
          <Bar dataKey="deltaMs" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isPb ? "#f59e0b" : entry.deltaMs >= 0 ? "#0ea5e9" : "#ef4444"}
                fillOpacity={entry.isPb ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
