"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="group relative w-full">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/45 via-transparent to-primary/4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-2xl border border-border/60 bg-surface-strong/90 px-4 pr-12 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-200 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-white/80 text-muted transition-colors duration-200 group-hover:text-primary group-focus-within:border-primary/30 group-focus-within:text-primary">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  ),
);

Select.displayName = "Select";
