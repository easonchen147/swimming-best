"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { formatTimeMS } from "@/lib/format";

type ChartPoint = {
  performedOn: string;
  raw?: number;
  pb?: number;
  trend?: number;
};

export function PerformanceChart({
  raw,
  pb,
  trend,
}: {
  raw: Array<{ performedOn: string; timeMs: number }>;
  pb: Array<{ performedOn: string; timeMs: number }>;
  trend: Array<{ performedOn: string; timeMs: number }>;
}) {
  const data = raw.map((point, index) => ({
    performedOn: point.performedOn,
    raw: point.timeMs,
    pb: pb[index]?.timeMs,
    trend: trend[index]?.timeMs,
  })) satisfies ChartPoint[];

  return (
    <Card className="min-w-0">
      <div className="mb-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
          Progress Graph
        </div>
        <h3 className="mt-2 text-xl font-semibold text-primary">
          成绩波动、PB 包络线与趋势
        </h3>
      </div>
      <div className="h-[280px] min-w-0 w-full md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
          <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(30,64,175,0.08)" strokeDasharray="4 4" />
            <XAxis
              dataKey="performedOn"
              tick={{ fill: "#5c77a4", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#5c77a4", fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => formatTimeMS(Number(value ?? 0))}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(30,64,175,0.1)",
                boxShadow: "0 16px 40px rgba(30,64,175,0.12)",
              }}
            />
            <Line
              type="monotone"
              dataKey="raw"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pb"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#1E40AF"
              strokeWidth={2}
              strokeDasharray="8 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
