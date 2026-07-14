"use client";

import { memo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionHeaderProps {
  caption: string;
  title: string;
  titleHighlight?: string;
  description: string;
  reducedMotion?: boolean;
}

/**
 * SectionHeader
 * 
 * Reusable component for section titles with premium typography.
 * Animates on scroll-into-view with staggered reveals.
 * 
 * Architecture:
 * - Caption: Small uppercase label (gold accent)
 * - Title: Large editorial display with optional highlighted word
 * - Description: Supporting paragraph with muted color
 */
export const SectionHeader = memo(function SectionHeader({
  caption,
  title,
  titleHighlight,
  description,
  reducedMotion = false,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Caption */}
      <motion.p
        className="text-editorial-caption text-gold mb-4"
        variants={itemVariants}
      >
        {caption}
      </motion.p>

      {/* Title */}
      <motion.h2
        className="text-editorial-display text-white mb-6"
        variants={itemVariants}
      >
        {titleHighlight ? (
          <>
            {title.split(titleHighlight)[0]}
            <span className="text-gold-gradient">{titleHighlight}</span>
            {title.split(titleHighlight)[1]}
          </>
        ) : (
          title
        )}
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-editorial-subheading"
        variants={itemVariants}
      >
        {description}
      </motion.p>
    </motion.div>
  );
});