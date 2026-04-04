"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { FADE_IN_UP } from "@/lib/animations";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={FADE_IN_UP}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}
