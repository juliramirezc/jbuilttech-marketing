"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { MOBILE_BLUEPRINT_DISSOLVE } from "./mobile/scrollThresholds";

interface BlueprintLayerMobileProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * Mobile blueprint — holds through planning, then dissolves into Digital Presence.
 */
export const BlueprintLayerMobile = memo(function BlueprintLayerMobile({
  scrollProgress,
  reducedMotion,
}: BlueprintLayerMobileProps) {
  const [dissolveStart, dissolveEnd] = MOBILE_BLUEPRINT_DISSOLVE;

  const opacity = useTransform(
    scrollProgress,
    [0, 0.08, dissolveStart, dissolveEnd],
    [1, 1, 1, 0]
  );

  const scale = useTransform(
    scrollProgress,
    [0, dissolveEnd],
    reducedMotion ? [1, 1] : [1, 1.06]
  );

  const blur = useTransform(
    scrollProgress,
    [dissolveStart, dissolveEnd],
    reducedMotion ? [0, 0] : [0, 10]
  );

  return (
    <motion.div
      className="lg:hidden absolute inset-0 will-change-transform"
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

      <div className="absolute inset-0 bg-blue-950/10 mix-blend-multiply pointer-events-none" />

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
