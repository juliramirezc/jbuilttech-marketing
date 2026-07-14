"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HERO_COPY } from "@/constants";

/**
 * TrustBadges Component
 * 
 * Social proof badges displayed in the hero section.
 */

interface TrustBadgesProps {
  className?: string;
}

export function TrustBadges({ className }: TrustBadgesProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex items-center gap-3 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 1,
      }}
    >
      {/* Trust indicator dot */}
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      
      {/* Trust text */}
      <span className="text-body-sm text-concrete-500">
        {HERO_COPY.trustBadge}
      </span>
    </motion.div>
  );
}
