import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "panel-glow rounded-[28px] border border-border bg-surface px-5 py-5 shadow-sm md:px-6 md:py-6",
        className,
      )}
      {...props}
    />
  );
}

