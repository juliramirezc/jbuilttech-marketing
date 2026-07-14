"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HERO_COPY } from "@/constants";

/**
 * HeroHeadline Component
 * 
 * The main headline and subheadline for the hero section.
 * Animates in with a staggered reveal effect.
 */

interface HeroHeadlineProps {
  className?: string;
}

export function HeroHeadline({ className }: HeroHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: prefersReducedMotion ? 0 : 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className={`max-w-4xl ${className || ""}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Headline */}
      <motion.h1
        className="text-display-lg md:text-display-xl lg:text-display-2xl font-display font-bold tracking-tight"
        variants={itemVariants}
      >
        <span className="block text-concrete-50">{HERO_COPY.headline}</span>
        <span className="block text-gradient-gold mt-2">{HERO_COPY.headlineAccent}</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="mt-6 md:mt-8 text-body-lg md:text-body-xl text-concrete-400 max-w-2xl"
        variants={itemVariants}
      >
        {HERO_COPY.subheadline}
      </motion.p>
    </motion.div>
  );
}
