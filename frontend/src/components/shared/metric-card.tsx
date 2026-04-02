import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
        {label}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold text-primary md:text-4xl">
          {value}
        </div>
        <ArrowUpRight className="h-5 w-5 text-accent" />
      </div>
      <div className="mt-3 text-sm text-muted">{caption}</div>
    </Card>
  );
}
