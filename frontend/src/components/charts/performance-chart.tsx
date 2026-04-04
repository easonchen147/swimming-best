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

import { AnimatedChart } from "@/components/charts/animated-chart";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Card } from "@/components/ui/card";

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
    <AnimatedChart>
      <Card className="h-full min-w-0 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-1">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
            Performance Analytics
          </div>
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            成绩波动、PB 包络线与趋势
          </h3>
        </div>
        <div className="h-[280px] min-w-0 w-full md:h-[360px]">
          <ResponsiveContainer height="100%" minHeight={280} minWidth={0} width="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid
                stroke="rgba(15,23,42,0.06)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="performedOn"
                dy={10}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip title="Performance" />}
                cursor={{ stroke: "rgba(79, 70, 229, 0.1)", strokeWidth: 2 }}
              />
              <Line
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
                dataKey="raw"
                dot={{ r: 4, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
                name="单次成绩"
                stroke="#4F46E5"
                strokeWidth={3}
                type="monotone"
              />
              <Line
                animationDuration={2000}
                animationEasing="ease-in-out"
                dataKey="pb"
                dot={false}
                name="个人最好（PB）"
                stroke="#F59E0B"
                strokeWidth={4}
                type="monotone"
              />
              <Line
                animationDuration={2500}
                animationEasing="ease-in-out"
                dataKey="trend"
                dot={false}
                name="技术趋势"
                stroke="#0EA5E9"
                strokeDasharray="8 6"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </AnimatedChart>
  );
}
