"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

import { INTERACTIVE_VARIANTS } from "@/lib/animations";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-white shadow-sm shadow-primary/20 hover:bg-[#4338ca]",
        secondary:
          "border-primary/10 bg-primary/[0.07] text-primary hover:bg-primary/[0.12]",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-surface hover:text-primary",
        danger:
          "border-transparent bg-rose-500 text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600",
        outline:
          "border-border bg-background/80 text-foreground hover:border-primary/20 hover:bg-surface",
        success:
          "border-transparent bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { asChild = false, className, variant, size, loading, success, children, ...props },
    ref,
  ) => {
    const currentVariant = success ? "success" : variant;
    const classes = cn(buttonVariants({ variant: currentVariant, size }), className);
    const motionButtonProps = props as React.ComponentPropsWithoutRef<typeof motion.button>;

    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    const content = (
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key="loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>处理中...</span>
          </motion.span>
        ) : success ? (
          <motion.span
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            className="flex items-center gap-2"
            exit={{ opacity: 0, scale: 0.7 }}
            initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
            key="success"
          >
            <Check className="h-4 w-4" />
            <span>成功</span>
          </motion.span>
        ) : (
          <motion.span
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
            exit={{ opacity: 0 }}
            initial={false}
            key="content"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    );

    return (
      <motion.button
        className={classes}
        disabled={loading || props.disabled}
        ref={ref}
        variants={INTERACTIVE_VARIANTS}
        whileHover={!loading && !success ? "hover" : undefined}
        whileTap={!loading && !success ? "tap" : undefined}
        {...motionButtonProps}
      >
        {content}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
