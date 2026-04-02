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

const palette = ["#1E40AF", "#F59E0B", "#3B82F6", "#0EA5E9", "#10B981"];

export function CompareChart({
  swimmers,
}: {
  swimmers: Array<{
    swimmerId: string;
    displayName: string;
    series: { pb: Array<{ performedOn: string; timeMs: number }> };
  }>;
}) {
  const points = swimmers.flatMap((swimmer) =>
    swimmer.series.pb.map((point) => point.performedOn),
  );
  const uniqueDates = [...new Set(points)].sort();

  const data = uniqueDates.map((performedOn) => {
    const record: Record<string, string | number | null> = { performedOn };
    for (const swimmer of swimmers) {
      const point = swimmer.series.pb.find((item) => item.performedOn === performedOn);
      record[swimmer.swimmerId] = point?.timeMs ?? null;
    }
    return record;
  });

  return (
    <Card className="h-[360px]">
      <div className="mb-4">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
          Compare Curves
        </div>
        <h3 className="mt-2 text-xl font-semibold text-primary">
          同项目 PB 曲线对比
        </h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
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
            tickFormatter={(value) => `${(Number(value) / 1000).toFixed(1)}s`}
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
          {swimmers.map((swimmer, index) => (
            <Line
              key={swimmer.swimmerId}
              type="monotone"
              dataKey={swimmer.swimmerId}
              name={swimmer.displayName}
              stroke={palette[index % palette.length]}
              strokeWidth={3}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
