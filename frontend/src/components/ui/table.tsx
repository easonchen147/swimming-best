"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "motion/react";

import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-2xl border border-border/60 bg-surface-strong/80">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("[&_tr]:border-b border-border/50 bg-surface/40", className)} {...props} />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLMotionProps<"tbody">) {
  return (
    <motion.tbody
      animate="animate"
      className={cn("[&_tr:last-child]:border-0", className)}
      initial="initial"
      variants={STAGGER_CONTAINER}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLMotionProps<"tr">) {
  return (
    <motion.tr
      className={cn(
        "border-b border-border/50 transition-colors hover:bg-primary/4 data-[state=selected]:bg-surface",
        className,
      )}
      variants={FADE_IN_UP}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.14em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-4 align-middle", className)} {...props} />;
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn("mt-4 text-sm text-muted", className)} {...props} />;
}
