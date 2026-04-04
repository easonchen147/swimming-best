"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  caption,
  className,
}: {
  label: string;
  value: string;
  caption: string;
  className?: string;
}) {
  return (
    <Card className={cn("group relative overflow-hidden h-full", className)}>
      <motion.div 
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors"
      />
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">
            {label}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        
        <div className="mt-4 mb-2 flex items-baseline gap-2">
          <div className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            {value}
          </div>
        </div>
        
        <div className="mt-auto flex items-center gap-2 text-sm font-medium text-muted/80">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="truncate">{caption}</span>
        </div>
      </CardContent>
    </Card>
  );
}
