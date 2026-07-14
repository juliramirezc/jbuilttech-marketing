"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * BlueprintGrid Component
 * 
 * Full-screen blueprint grid background that establishes
 * the architectural/construction aesthetic.
 */

interface BlueprintGridProps {
  className?: string;
}

export function BlueprintGrid({ className }: BlueprintGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute inset-0 blueprint-grid pointer-events-none ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 1.5,
        ease: "easeOut",
      }}
      style={{
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
      }}
    />
  );
}
