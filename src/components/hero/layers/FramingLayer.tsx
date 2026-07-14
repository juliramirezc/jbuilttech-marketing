"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

interface FramingLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * FramingLayer
 * 
 * Phase 1-2: House under construction with wood framing
 * Emerges: 10-30% scroll (clip-path reveal from center)
 * Fades out: 30-55% as finished home appears
 */
export const FramingLayer = memo(function FramingLayer({
  scrollProgress,
  reducedMotion,
}: FramingLayerProps) {
  // Opacity: Fades in 10-25%, holds, fades out 45-55%
  const opacity = useTransform(
    scrollProgress,
    [0.1, 0.25, 0.45, 0.55],
    [0, 1, 1, 0]
  );

  // Scale: Slight zoom out for depth
  const scale = useTransform(
    scrollProgress,
    [0.1, 0.55],
    reducedMotion ? [1, 1] : [1.05, 1]
  );

  // Clip-path: Reveal from center (like construction building outward)
  const clipProgress = useTransform(
    scrollProgress,
    [0.1, 0.28],
    [0, 100]
  );

  // Y parallax for depth
  const y = useTransform(
    scrollProgress,
    [0.1, 0.55],
    reducedMotion ? ["0%", "0%"] : ["3%", "-2%"]
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{
        opacity,
        scale,
        y,
        clipPath: reducedMotion
          ? "inset(0%)"
          : useTransform(clipProgress, (v) => `inset(${50 - v / 2}% ${50 - v / 2}% ${50 - v / 2}% ${50 - v / 2}%)`),
      }}
    >
      <Image
        src="/images/hero/house-framing.png"
        alt="Luxury home under construction with wood framing and trusses"
        fill
        quality={90}
        className="object-cover object-center"
        sizes="100vw"
        unoptimized
      />
    </motion.div>
  );
});
