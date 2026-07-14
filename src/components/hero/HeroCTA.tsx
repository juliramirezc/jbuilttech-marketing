"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HERO_COPY, ROUTES } from "@/constants";
import { trackCTAClick, cn } from "@/lib";

/**
 * HeroCTA Component
 * 
 * Primary and secondary call-to-action buttons for the hero.
 */

interface HeroCTAProps {
  className?: string;
}

export function HeroCTA({ className }: HeroCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  const handlePrimaryCTA = () => {
    trackCTAClick("hero_consultation", "hero");
  };

  const handleSecondaryCTA = () => {
    trackCTAClick("hero_portfolio", "hero");
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-fast ease-smooth focus-ring";
  const primaryStyles = cn(
    baseStyles,
    "px-8 py-4 text-body-lg rounded-md",
    "bg-amber-500 text-charcoal-950 font-semibold",
    "hover:bg-amber-400 active:bg-amber-600",
    "shadow-lg shadow-amber-500/20",
    "border border-amber-400/50"
  );
  const secondaryStyles = cn(
    baseStyles,
    "px-8 py-4 text-body-lg rounded-md",
    "bg-transparent text-concrete-50 font-medium",
    "border border-concrete-700 hover:border-concrete-500",
    "hover:bg-concrete-800/50 active:bg-concrete-800"
  );

  return (
    <motion.div
      className={`flex flex-col sm:flex-row gap-4 ${className || ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.8,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <a
        href={ROUTES.SECTION_CONSULTATION}
        onClick={handlePrimaryCTA}
        className={primaryStyles}
      >
        {HERO_COPY.primaryCta}
      </a>

      <a
        href={ROUTES.SECTION_PORTFOLIO}
        onClick={handleSecondaryCTA}
        className={secondaryStyles}
      >
        {HERO_COPY.secondaryCta}
      </a>
    </motion.div>
  );
}
