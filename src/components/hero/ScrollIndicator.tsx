"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollIndicator Component
 * 
 * Animated scroll indicator that hints users to scroll down.
 */

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className }: ScrollIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 1.2,
      }}
    >
      <span className="text-body-xs text-concrete-500 uppercase tracking-widest">
        Scroll to explore
      </span>
      <motion.div
        className="w-6 h-10 border-2 border-concrete-700 rounded-full flex justify-center pt-2"
        animate={
          prefersReducedMotion
            ? {}
            : {
                borderColor: ["rgb(64, 64, 64)", "rgb(100, 100, 100)", "rgb(64, 64, 64)"],
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-1.5 h-1.5 bg-concrete-500 rounded-full"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, 12, 0],
                  opacity: [1, 0.5, 1],
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
