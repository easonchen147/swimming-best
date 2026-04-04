"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { FADE_IN_UP } from "@/lib/animations";

/**
 * A wrapper component that provides standardized entry animations 
 * for chart components.
 */
export function AnimatedChart({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  return (
    <motion.div
      variants={FADE_IN_UP}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className="w-full min-w-0"
    >
      {children}
    </motion.div>
  );
}
