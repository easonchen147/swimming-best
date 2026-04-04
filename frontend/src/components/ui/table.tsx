"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";
import { STAGGER_CONTAINER, FADE_IN_UP } from "@/lib/animations";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("[&_tr]:border-b border-border/40 bg-surface/30", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLMotionProps<"tbody">) {
  return (
    <motion.tbody
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: HTMLMotionProps<"tr">) {
  return (
    <motion.tr
      variants={FADE_IN_UP}
      className={cn(
        "border-b border-border/40 transition-colors hover:bg-primary/5 data-[state=selected]:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-semibold text-muted tracking-tight transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted", className)}
      {...props}
    />
  );
}
