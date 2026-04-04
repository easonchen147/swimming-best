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

import { Card } from "@/components/ui/card";
import { AnimatedChart } from "@/components/charts/animated-chart";
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

  const data = useMemo(() => buildCompareData(swimmers), [swimmers]);
  const visibleSwimmers = swimmers.filter((swimmer) => !hiddenIds.includes(swimmer.swimmerId));

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
    <AnimatedChart>
      <Card className="min-w-0 border-border/40 p-6 shadow-xl shadow-primary/5 md:p-8">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/40">
              Comparative Analysis
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              进步曲线对比
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {swimmers.map((swimmer, index) => {
              const hidden = hiddenIds.includes(swimmer.swimmerId);
              return (
                <button
                  aria-label={`切换 ${swimmer.displayName} 曲线`}
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
        </div>

        <div className="h-[360px] min-w-0 w-full md:h-[480px]">
          <ResponsiveContainer height="100%" minHeight={320} minWidth={0} width="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="rgba(15,23,42,0.06)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="date"
                dy={10}
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
                  dataKey={swimmer.swimmerId}
                  dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
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
      </Card>
    </AnimatedChart>
  );
}
