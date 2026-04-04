"use client";

import { motion } from "motion/react";
import { formatTimeMS } from "@/lib/format";

interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
  stroke?: string;
  dataKey?: string | number;
  payload?: unknown;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  title?: string;
}

export function ChartTooltip({ active, payload, label, title }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="glass-card flex flex-col gap-1.5 border-primary/10 px-4 py-3 shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/50">
          {title || "Time Record"}
        </span>
        <span className="text-sm font-black text-foreground">{label}</span>
      </div>
      <div className="h-px w-full bg-border/40" />
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color || entry.stroke }} 
              />
              <span className="text-xs font-bold text-muted">{entry.name}:</span>
            </div>
            <span className="font-mono text-xs font-black text-foreground">
              {formatTimeMS(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
