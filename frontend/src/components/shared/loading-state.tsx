"use client";

import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SKELETON_VARIANTS } from "@/lib/animations";

export function LoadingState({ label }: { label: string }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary/50">
          {label}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div 
          variants={SKELETON_VARIANTS}
          initial="initial"
          animate="animate"
          className="h-8 w-1/2 rounded-xl bg-primary/5" 
        />
        <div className="space-y-2">
          <motion.div 
            variants={SKELETON_VARIANTS}
            initial="initial"
            animate="animate"
            className="h-4 w-full rounded-lg bg-primary/5" 
          />
          <motion.div 
            variants={SKELETON_VARIANTS}
            initial="initial"
            animate="animate"
            className="h-4 w-3/4 rounded-lg bg-primary/5" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
