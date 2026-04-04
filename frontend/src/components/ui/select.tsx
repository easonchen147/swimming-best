"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative group w-full">
      <select
        ref={ref}
        className={cn(
          "input-modern h-11 w-full appearance-none px-4 pr-10 text-sm transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-primary">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  ),
);

Select.displayName = "Select";
