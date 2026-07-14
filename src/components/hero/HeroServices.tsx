"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SERVICES } from "@/constants";

/**
 * HeroServices Component
 * 
 * A row of service badges displayed in the hero section.
 */

interface HeroServicesProps {
  className?: string;
}

export function HeroServices({ className }: HeroServicesProps) {
  const prefersReducedMotion = useReducedMotion();

  const displayServices = SERVICES.slice(0, 5);

  return (
    <motion.div
      className={`flex flex-wrap gap-2 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.9,
      }}
    >
      {displayServices.map((service, index) => (
        <motion.span
          key={service.id}
          className="px-3 py-1 text-body-xs bg-charcoal-800/50 border border-charcoal-700 rounded-full text-concrete-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.9 + index * 0.05,
          }}
        >
          {service.shortName}
        </motion.span>
      ))}
    </motion.div>
  );
}
