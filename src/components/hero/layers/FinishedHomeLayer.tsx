"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

interface FinishedHomeLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * FinishedHomeLayer
 * 
 * Phase 2-3: Completed luxury home at golden hour
 * Emerges: 45-55% scroll
 * Scales down: 55-70% to become the website hero image
 * Holds position while digital ecosystem appears
 */
export const FinishedHomeLayer = memo(function FinishedHomeLayer({
  scrollProgress,
  reducedMotion,
}: FinishedHomeLayerProps) {
  // Opacity: Fades in 45-55%, holds through rest
  const opacity = useTransform(
    scrollProgress,
    [0.45, 0.55, 0.95, 1],
    [0, 1, 1, 0.8]
  );

  // Scale: Full size, then scales down to fit inside laptop
  const scale = useTransform(
    scrollProgress,
    [0.45, 0.55, 0.65, 0.75],
    reducedMotion ? [1, 1, 0.55, 0.55] : [1.02, 1, 0.6, 0.55]
  );

  // Y position: Moves up as it scales down
  const y = useTransform(
    scrollProgress,
    [0.55, 0.75],
    reducedMotion ? ["0%", "-15%"] : ["0%", "-18%"]
  );

  // Warm color temperature overlay
  const warmth = useTransform(
    scrollProgress,
    [0.45, 0.6],
    [0, 0.08]
  );

  // Border radius appears as it becomes the "website hero"
  const borderRadius = useTransform(
    scrollProgress,
    [0.6, 0.7],
    [0, 8]
  );

  // Shadow appears as it "lifts" off the background
  const shadowOpacity = useTransform(
    scrollProgress,
    [0.6, 0.75],
    [0, 0.4]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center will-change-transform"
      style={{ opacity }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          scale,
          y,
          borderRadius: useTransform(borderRadius, (v) => `${v}px`),
          boxShadow: useTransform(
            shadowOpacity,
            (v) => `0 25px 80px rgba(0, 0, 0, ${v}), 0 10px 30px rgba(0, 0, 0, ${v * 0.5})`
          ),
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/hero/finished-home.png"
          alt="Completed luxury custom home at golden hour with warm lighting"
          fill
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        
        {/* Warm overlay for golden hour feel */}
        <motion.div
          className="absolute inset-0 bg-amber-500 mix-blend-soft-light pointer-events-none"
          style={{ opacity: warmth }}
        />
      </motion.div>
    </motion.div>
  );
});
