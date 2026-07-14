"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProcessCardProps {
  step: ProcessStep;
  lineProgress: MotionValue<number>;
  index: number;
  totalSteps: number;
  reducedMotion: boolean;
}

/**
 * ProcessCard
 * 
 * Individual process step card with:
 * - Premium icon container with blueprint accent
 * - Step number badge
 * - Title and description
 * - Scroll-driven reveal tied to blueprint line progress
 * 
 * Animation Strategy:
 * - Card reveals when blueprint line reaches its position
 * - Uses GPU-accelerated transforms (opacity, scale, y)
 * - Icon has subtle rotation animation on reveal
 */
export const ProcessCard = memo(function ProcessCard({
  step,
  lineProgress,
  index,
  totalSteps,
  reducedMotion,
}: ProcessCardProps) {
  // Calculate when this card should appear based on line progress
  // Each card appears when the line reaches its segment
  const segmentSize = 1 / totalSteps;
  const startProgress = index * segmentSize;
  const endProgress = startProgress + segmentSize * 0.6;

  const cardOpacity = useTransform(
    lineProgress,
    [startProgress, endProgress],
    [0, 1]
  );

  const cardY = useTransform(
    lineProgress,
    [startProgress, endProgress],
    reducedMotion ? [0, 0] : [30, 0]
  );

  const cardScale = useTransform(
    lineProgress,
    [startProgress, endProgress],
    reducedMotion ? [1, 1] : [0.95, 1]
  );

  const iconRotate = useTransform(
    lineProgress,
    [startProgress, endProgress],
    reducedMotion ? [0, 0] : [-10, 0]
  );

  const stepNumber = String(step.id).padStart(2, "0");

  return (
    <motion.div
      className="relative flex flex-col items-center text-center group"
      style={{
        opacity: cardOpacity,
        y: cardY,
        scale: cardScale,
      }}
    >
      {/* Icon container with blueprint accent */}
      <motion.div
        className="relative mb-6"
        style={{ rotate: iconRotate }}
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 -m-2 rounded-full bg-[rgb(59,130,180)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Icon container */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-[#111]/80 border border-white/[0.06] backdrop-blur-sm">
          {/* Blueprint corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[rgb(59,130,180)]/40 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[rgb(59,130,180)]/40 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[rgb(59,130,180)]/40 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[rgb(59,130,180)]/40 rounded-br-lg" />
          
          {/* Icon */}
          <div className="text-white/90 w-8 h-8 md:w-10 md:h-10">
            {step.icon}
          </div>
        </div>

        {/* Step number badge */}
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-[rgb(241,208,99)] to-[rgb(212,175,55)] flex items-center justify-center shadow-lg shadow-[rgb(212,175,55)]/20">
          <span className="text-[10px] font-semibold text-[#0b0b0b] tracking-wider">
            {stepNumber}
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-[200px] md:max-w-[220px]">
        <h3 className="text-lg md:text-xl font-medium text-white mb-2 tracking-tight">
          {step.title}
        </h3>
        <p className="text-sm md:text-base text-white/60 leading-relaxed font-light">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
});