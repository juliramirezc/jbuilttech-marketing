"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";

interface HeroContentProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * HeroContent
 * 
 * Text overlay with headline, subheadline, and CTAs
 * Fades out as the visual story takes over
 */
export const HeroContent = memo(function HeroContent({
  scrollProgress,
  reducedMotion,
}: HeroContentProps) {
  // Content fades out as user scrolls into the transformation
  const opacity = useTransform(
    scrollProgress,
    [0, 0.08, 0.15],
    [1, 1, 0]
  );

  const y = useTransform(
    scrollProgress,
    [0, 0.15],
    reducedMotion ? ["0%", "0%"] : ["0%", "-10%"]
  );

  // Release pointer events once faded — avoids blocking DigitalPresenceLayer CTA
  const pointerEvents = useTransform(scrollProgress, (v) =>
    v >= 0.15 ? "none" : "auto"
  );

  return (
    <motion.div
      className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-20 xl:px-32"
      style={{ opacity, y, pointerEvents }}
    >
      <div className="max-w-4xl">
        {/* Eyebrow */}
        <motion.p
          className="text-editorial-caption text-gold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            delay: reducedMotion ? 0 : 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Premium Digital Agency for Contractors
        </motion.p>

        {/* Primary Headline */}
        <motion.h1
          className="text-editorial-hero text-white mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 1,
            delay: reducedMotion ? 0 : 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Websites & Marketing
          <br />
          <span className="text-gold-gradient">Built Exclusively for Contractors</span>
        </motion.h1>

        {/* Secondary Headline */}
        <motion.p
          className="text-xl md:text-2xl text-white/80 font-light mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            delay: reducedMotion ? 0 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          We build your brand the same way you build a home.
        </motion.p>

        {/* Supporting Copy */}
        <motion.p
          className="text-editorial-subheading max-w-2xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            delay: reducedMotion ? 0 : 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          From blueprint to finished brand, we create websites, branding, and marketing 
          systems that help contractors earn more trust and win more projects.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.8,
            delay: reducedMotion ? 0 : 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <a
            href={CALENDLY_BOOKING_URL}
            className="btn-primary"
            {...getExternalLinkProps()}
          >
            Build My Brand
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
});
