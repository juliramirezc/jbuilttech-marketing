"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

interface BlueprintLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * BlueprintLayer
 * 
 * Phase 0-1: Blueprint house with architectural overlay
 * Visible: 0-30% scroll
 * Fades out as construction framing emerges
 */
export const BlueprintLayer = memo(function BlueprintLayer({
  scrollProgress,
  reducedMotion,
}: BlueprintLayerProps) {
  // Opacity: Full at start, fades out 10-30%
  const opacity = useTransform(
    scrollProgress,
    [0, 0.1, 0.25, 0.3],
    [1, 1, 0.3, 0]
  );

  // Slight scale for depth
  const scale = useTransform(
    scrollProgress,
    [0, 0.3],
    reducedMotion ? [1, 1] : [1, 1.05]
  );

  // Blur as it fades (creates depth)
  const blur = useTransform(
    scrollProgress,
    [0.1, 0.3],
    reducedMotion ? [0, 0] : [0, 8]
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{
        opacity,
        scale,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
      }}
    >
      <Image
        src="/images/hero/blueprint-house.png"
        alt="Architectural blueprint of a luxury home"
        fill
        priority
        quality={90}
        className="object-cover object-center"
        sizes="100vw"
        unoptimized
      />
      
      {/* Blueprint tint overlay */}
      <div className="absolute inset-0 bg-blue-950/10 mix-blend-multiply pointer-events-none" />
      
      {/* Text readability gradient - only on blueprint layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to right,
            rgba(8, 12, 20, 0.78) 0%,
            rgba(8, 12, 20, 0.65) 25%,
            rgba(8, 12, 20, 0.45) 45%,
            rgba(8, 12, 20, 0.20) 65%,
            transparent 85%
          )`,
        }}
      />
    </motion.div>
  );
});
