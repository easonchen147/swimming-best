"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "motion/react";

import { cn } from "@/lib/utils";

export type InputProps = Omit<HTMLMotionProps<"input">, "ref">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <motion.input
      className={cn(
        "flex h-10 w-full rounded-xl border border-border/70 bg-surface-strong/90 px-3 py-2 text-sm text-foreground shadow-sm shadow-black/[0.03] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      transition={{ duration: 0.18 }}
      type={type}
      whileFocus={{ scale: 1.004 }}
      {...props}
    />
  ),
);

Input.displayName = "Input";
