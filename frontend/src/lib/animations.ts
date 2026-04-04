import { Variants } from "motion/react";

/**
 * Standard transition for fluid, professional feel.
 * Balanced between speed and visibility.
 */
export const STANDARD_TRANSITION = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
};

/**
 * Fade in and scale up from slightly below.
 * Good for dashboard cards and page entry.
 */
export const FADE_IN_UP: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: STANDARD_TRANSITION
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

/**
 * Staggered children container.
 * Use this on a parent to animate children in sequence.
 */
export const STAGGER_CONTAINER: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

/**
 * Layout projection variant for smooth reordering and size changes.
 * Use with layoutId for cross-fade transitions.
 */
export const LAYOUT_TRANSITION = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: STANDARD_TRANSITION
};

/**
 * Micro-interaction feedback for buttons and interactive cards.
 */
export const INTERACTIVE_VARIANTS: Variants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } }
};

/**
 * Skeleton pulse animation for loading states.
 */
export const SKELETON_VARIANTS: Variants = {
  initial: { opacity: 0.5 },
  animate: { 
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
