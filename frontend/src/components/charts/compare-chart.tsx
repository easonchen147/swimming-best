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
import { useMemo, useState } from "react";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { CompareSwimmer } from "@/lib/types";

const colors = ["#4F46E5", "#F59E0B", "#10B981", "#EC4899"];

function buildCompareData(swimmers: CompareSwimmer[]) {
  const dates = Array.from(
    new Set(
      swimmers.flatMap((swimmer) =>
        swimmer.series.raw.map((point) => point.performedOn),
      ),
    ),
  ).sort();

  return dates.map((date) => {
    const point: Record<string, string | number> = { date };

    swimmers.forEach((swimmer) => {
      const performance = swimmer.series.raw.find((item) => item.performedOn === date);
      if (performance) {
        point[swimmer.swimmerId] = performance.timeMs;
      }
    });

    return point;
  });
}

export function CompareChart({ swimmers }: { swimmers: CompareSwimmer[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const mounted = typeof window !== "undefined";

  const data = useMemo(() => buildCompareData(swimmers), [swimmers]);
  const visibleSwimmers = swimmers.filter((swimmer) => !hiddenIds.includes(swimmer.swimmerId));

  if (!mounted) {
    return <div className="h-[400px] w-full animate-pulse rounded-2xl bg-slate-50 md:h-[500px]" />;
  }

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50/50 text-sm text-muted">
        暂无对比趋势数据
      </div>
    );
  }

  function toggleSwimmer(swimmerId: string) {
    setHiddenIds((current) => {
      if (current.includes(swimmerId)) {
        return current.filter((item) => item !== swimmerId);
      }
      if (current.length >= swimmers.length - 1) {
        return current;
      }
      return [...current, swimmerId];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {swimmers.map((swimmer, index) => {
          const hidden = hiddenIds.includes(swimmer.swimmerId);
          return (
            <button
              aria-label={`切换 ${swimmer.displayName} 队员曲线`}
              aria-pressed={!hidden}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                hidden
                  ? "border-border bg-surface text-muted"
                  : "border-transparent text-white shadow-lg"
              }`}
              key={swimmer.swimmerId}
              onClick={() => toggleSwimmer(swimmer.swimmerId)}
              onMouseEnter={() => setActiveId(swimmer.swimmerId)}
              onMouseLeave={() => setActiveId(null)}
              style={
                hidden
                  ? undefined
                  : {
                      backgroundColor: colors[index % colors.length],
                      boxShadow: `0 12px 30px ${colors[index % colors.length]}33`,
                    }
              }
              type="button"
            >
              {swimmer.displayName}
            </button>
          );
        })}
      </div>

      <div className="h-[400px] w-full min-w-0 md:h-[500px]">
        <ResponsiveContainer height="100%" minHeight={300} width="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid
              stroke="rgba(15,23,42,0.06)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="date"
              dy={15}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              reversed
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={<ChartTooltip title="Compare" />}
              cursor={{ stroke: "rgba(79, 70, 229, 0.1)", strokeWidth: 2 }}
            />
            {visibleSwimmers.map((swimmer, index) => (
              <Line
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={1000 + index * 250}
                connectNulls
                dataKey={swimmer.swimmerId}
                dot={{ r: 4, stroke: colors[index % colors.length], strokeWidth: 2, fill: "#fff" }}
                isAnimationActive={false}
                key={swimmer.swimmerId}
                name={swimmer.displayName}
                stroke={colors[index % colors.length]}
                strokeOpacity={
                  activeId && activeId !== swimmer.swimmerId ? 0.3 : 1
                }
                strokeWidth={activeId === swimmer.swimmerId ? 5 : 3}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
