"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps, AnimatePresence } from "motion/react";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { INTERACTIVE_VARIANTS } from "@/lib/animations";

const buttonVariants = cva(
  "relative inline-flex cursor-pointer items-center justify-center rounded-2xl border text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-white shadow-lg shadow-primary/20 hover:bg-[#4338ca] active:bg-[#3730a3]",
        secondary:
          "border-primary/10 bg-surface-strong text-primary hover:border-primary/20 hover:bg-white",
        ghost:
          "border-transparent bg-transparent text-primary hover:bg-primary/5",
        danger:
          "border-transparent bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20",
        outline:
          "border-border bg-transparent text-foreground hover:bg-surface hover:border-primary/20",
        success:
          "border-transparent bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  success?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, success, children, ...props }, ref) => {
    const currentVariant = success ? "success" : variant;

    return (
      <motion.button
        className={cn(buttonVariants({ variant: currentVariant, size }), className)}
        ref={ref}
        variants={INTERACTIVE_VARIANTS}
        whileHover={!loading && !success ? "hover" : undefined}
        whileTap={!loading && !success ? "tap" : undefined}
        disabled={loading || props.disabled}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>处理中...</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              <span>成功</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

Button.displayName = "Button";
