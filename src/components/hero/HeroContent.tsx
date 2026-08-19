"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import { ConversionCta, useLeadModal } from "@/components/lead";

interface HeroContentProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * BLUEPRINT conversion block — first thing contractors see.
 */
export const HeroContent = memo(function HeroContent({
  scrollProgress,
  reducedMotion,
}: HeroContentProps) {
  const { openLeadModal } = useLeadModal();

  const opacity = useTransform(scrollProgress, [0, 0.12, 0.22], [1, 1, 0]);
  const y = useTransform(
    scrollProgress,
    [0, 0.22],
    reducedMotion ? ["0%", "0%"] : ["0%", "-8%"]
  );
  const pointerEvents = useTransform(scrollProgress, (v) =>
    v >= 0.22 ? "none" : "auto"
  );

  return (
    <motion.div
      className="relative z-20 h-full flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28"
      style={{ opacity, y, pointerEvents }}
    >
      <div className="max-w-3xl">
        <motion.p
          className="text-editorial-caption text-gold mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            delay: reducedMotion ? 0 : 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Blueprint
        </motion.p>

        <motion.h1
          className="text-[clamp(1.85rem,5.5vw,3.75rem)] font-semibold text-white tracking-tight leading-[1.05] mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.75,
            delay: reducedMotion ? 0 : 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          GOOD WORK DOESN&apos;T WIN JOBS IF NOBODY SEES IT.
        </motion.h1>

        <motion.div
          className="space-y-2.5 sm:space-y-3 text-base sm:text-lg md:text-xl text-white/85 font-light mb-5 sm:mb-6 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.7,
            delay: reducedMotion ? 0 : 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p>You can be the better contractor.</p>
          <p>You can do cleaner work.</p>
          <p>You can answer the phone.</p>
          <p>You can take care of the homeowner.</p>
          <p className="text-white font-medium pt-1">
            And the other guy can still get the job.
          </p>
        </motion.div>

        <motion.div
          className="mb-8 sm:mb-10 max-w-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.7,
            delay: reducedMotion ? 0 : 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <p className="text-2xl sm:text-3xl font-semibold text-gold tracking-tight mb-3">
            Why?
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-snug tracking-tight">
            Because the homeowner found him first.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.65,
            delay: reducedMotion ? 0 : 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ConversionCta onClick={() => openLeadModal("hero_primary")}>
            PUT YOUR WORK WHERE HOMEOWNERS ARE LOOKING
          </ConversionCta>
        </motion.div>
      </div>
    </motion.div>
  );
});
