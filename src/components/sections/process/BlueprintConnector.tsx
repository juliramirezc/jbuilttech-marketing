"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";

interface BlueprintConnectorProps {
  progress: MotionValue<number>;
  orientation: "horizontal" | "vertical";
  reducedMotion: boolean;
}

/**
 * BlueprintConnector
 * 
 * Animated blueprint line that connects process steps.
 * Draws itself as user scrolls, creating the feeling of
 * construction plans being revealed.
 * 
 * Architecture:
 * - SVG-based for crisp rendering at any scale
 * - Uses stroke-dashoffset animation for draw effect
 * - Blueprint styling: subtle blue with measurement marks
 * - GPU accelerated via transform/opacity
 * 
 * Orientation:
 * - Horizontal: Desktop view (single row of 6 cards)
 * - Vertical: Mobile view (stacked cards)
 */
export const BlueprintConnector = memo(function BlueprintConnector({
  progress,
  orientation,
  reducedMotion,
}: BlueprintConnectorProps) {
  // Line draws from 0% to 100% based on scroll progress
  const lineLength = orientation === "horizontal" ? 100 : 100;
  
  const drawProgress = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [lineLength, 0]
  );

  const lineOpacity = useTransform(
    progress,
    [0, 0.05],
    [0, 1]
  );

  if (orientation === "horizontal") {
    return (
      <div className="absolute top-[40px] md:top-[50px] left-0 right-0 h-[2px] pointer-events-none hidden lg:block">
        <motion.svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          style={{ opacity: lineOpacity }}
        >
          {/* Background track (subtle) */}
          <line
            x1="8"
            y1="1"
            x2="92"
            y2="1"
            stroke="rgb(59, 130, 180)"
            strokeOpacity="0.15"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Animated main line */}
          <motion.line
            x1="8"
            y1="1"
            x2="92"
            y2="1"
            stroke="rgb(59, 130, 180)"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="84"
            style={{
              strokeDashoffset: useTransform(drawProgress, (v) => (v / 100) * 84),
            }}
          />

          {/* Measurement tick marks */}
          {[16.67, 33.33, 50, 66.67, 83.33].map((pos, i) => (
            <motion.g
              key={i}
              style={{
                opacity: useTransform(
                  progress,
                  [(pos - 8) / 84, (pos - 8) / 84 + 0.1],
                  [0, 1]
                ),
              }}
            >
              <line
                x1={pos}
                y1="-3"
                x2={pos}
                y2="5"
                stroke="rgb(59, 130, 180)"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            </motion.g>
          ))}
        </motion.svg>

        {/* Blueprint dots at card positions */}
        {[8, 24.67, 41.33, 58, 74.67, 92].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[rgb(59,130,180)]"
            style={{
              left: `${pos}%`,
              opacity: useTransform(
                progress,
                [i / 6, i / 6 + 0.08],
                [0, 0.8]
              ),
              scale: useTransform(
                progress,
                [i / 6, i / 6 + 0.08],
                reducedMotion ? [1, 1] : [0, 1]
              ),
            }}
          />
        ))}
      </div>
    );
  }

  // Vertical orientation for mobile
  return (
    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none lg:hidden">
      <motion.svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        style={{ opacity: lineOpacity }}
      >
        {/* Background track */}
        <line
          x1="1"
          y1="5"
          x2="1"
          y2="95"
          stroke="rgb(59, 130, 180)"
          strokeOpacity="0.15"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Animated main line */}
        <motion.line
          x1="1"
          y1="5"
          x2="1"
          y2="95"
          stroke="rgb(59, 130, 180)"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="90"
          style={{
            strokeDashoffset: useTransform(drawProgress, (v) => (v / 100) * 90),
          }}
        />
      </motion.svg>

      {/* Blueprint dots at card positions */}
      {[8.33, 25, 41.67, 58.33, 75, 91.67].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[rgb(59,130,180)]"
          style={{
            top: `${pos}%`,
            opacity: useTransform(
              progress,
              [i / 6, i / 6 + 0.1],
              [0, 0.8]
            ),
            scale: useTransform(
              progress,
              [i / 6, i / 6 + 0.1],
              reducedMotion ? [1, 1] : [0, 1]
            ),
          }}
        />
      ))}
    </div>
  );
});