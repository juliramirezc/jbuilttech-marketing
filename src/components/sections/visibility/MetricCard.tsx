"use client";

import { memo, useEffect, useState } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

interface MetricCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  index: number;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * MetricCard
 * 
 * Displays a single metric with animated count-up effect.
 * Tied to scroll progress for sequential reveal.
 * 
 * Animation Strategy:
 * - Card fades in based on scroll position
 * - Number counts up using spring physics
 * - Icon has subtle scale animation
 */
export const MetricCard = memo(function MetricCard({
  value,
  label,
  icon,
  index,
  scrollProgress,
  reducedMotion,
}: MetricCardProps) {
  const [hasStartedCounting, setHasStartedCounting] = useState(false);

  // Staggered reveal — all metrics complete by ~34%
  const startProgress = 0.22 + index * 0.02;
  const endProgress = startProgress + 0.04;

  const cardOpacity = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 1]
  );

  const cardY = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    reducedMotion ? [0, 0] : [30, 0]
  );

  const cardScale = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    reducedMotion ? [1, 1] : [0.95, 1]
  );

  // Spring for count-up animation
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 25,
    mass: 1,
  });

  const displayValue = useTransform(spring, (current) => {
    if (value >= 1000) {
      return `${(current / 1000).toFixed(1)}K`;
    }
    return Math.round(current).toLocaleString();
  });

  // Trigger count-up when card becomes visible
  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (v) => {
      if (v >= startProgress && !hasStartedCounting) {
        setHasStartedCounting(true);
        spring.set(value);
      }
    });
    return unsubscribe;
  }, [scrollProgress, startProgress, hasStartedCounting, spring, value]);

  useEffect(() => {
    if (reducedMotion && !hasStartedCounting) {
      spring.set(value);
      setHasStartedCounting(true);
    }
  }, [reducedMotion, hasStartedCounting, spring, value]);

  return (
    <motion.div
      className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
      style={{
        opacity: cardOpacity,
        y: cardY,
        scale: cardScale,
      }}
    >
      {/* Icon */}
      <div className="w-10 h-10 mb-3 text-[rgb(59,130,180)] opacity-80">
        {icon}
      </div>

      {/* Animated number */}
      <motion.span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gold-gradient tracking-tight mb-1">
        {displayValue}
      </motion.span>

      {/* Label */}
      <p className="text-xs md:text-sm text-white/50 font-light tracking-wide">
        {label}
      </p>
    </motion.div>
  );
});