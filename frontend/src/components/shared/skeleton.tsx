"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SKELETON_VARIANTS } from "@/lib/animations";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      variants={SKELETON_VARIANTS}
      initial="initial"
      animate="animate"
      className={cn("rounded-md bg-primary/5", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-8 space-y-8 h-[400px] flex flex-col">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex-1 w-full flex items-end gap-2">
        <Skeleton className="h-[40%] flex-1" />
        <Skeleton className="h-[70%] flex-1" />
        <Skeleton className="h-[50%] flex-1" />
        <Skeleton className="h-[90%] flex-1" />
        <Skeleton className="h-[60%] flex-1" />
        <Skeleton className="h-[80%] flex-1" />
      </div>
    </div>
  );
}
