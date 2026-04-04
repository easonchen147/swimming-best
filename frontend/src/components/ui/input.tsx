"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

export type InputProps = Omit<HTMLMotionProps<"input">, "ref">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <motion.input
      type={type}
      className={cn(
        "input-modern flex h-11 w-full px-4 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      whileFocus={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      {...props}
    />
  ),
);

Input.displayName = "Input";
