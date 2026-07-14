"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

/**
 * ConstructionScene
 * 
 * Phase 2 of the Hero experience.
 * Shows the construction progression from foundation to framing.
 */

interface ConstructionSceneProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

export function ConstructionScene({ scrollProgress, className }: ConstructionSceneProps) {
  const opacity = useTransform(scrollProgress, [0.15, 0.25, 0.45, 0.55], [0, 1, 1, 0]);
  const framingProgress = useTransform(scrollProgress, [0.2, 0.45], [0, 1]);

  const woodColor = "#8B4513";
  const woodColorLight = "#A0522D";

  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center ${className || ""}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 800 500"
        className="w-full max-w-4xl h-auto"
        style={{ overflow: "visible" }}
      >
        {/* Foundation/Concrete slab */}
        <motion.rect
          x="130"
          y="385"
          width="540"
          height="30"
          fill="#6B7280"
          initial={{ scaleX: 0 }}
          style={{ scaleX: framingProgress, transformOrigin: "center" }}
        />

        {/* Wood framing - studs */}
        <motion.g fill={woodColor}>
          {[150, 220, 290, 360, 430, 500, 570, 640].map((x, i) => (
            <motion.rect
              key={`stud-${x}`}
              x={x}
              y="200"
              width="10"
              height="185"
              initial={{ scaleY: 0 }}
              style={{
                scaleY: useTransform(scrollProgress, [0.25 + i * 0.02, 0.35 + i * 0.02], [0, 1]),
                transformOrigin: "bottom",
              }}
            />
          ))}
        </motion.g>

        {/* Top plate */}
        <motion.rect
          x="145"
          y="195"
          width="510"
          height="10"
          fill={woodColorLight}
          initial={{ scaleX: 0 }}
          style={{
            scaleX: useTransform(scrollProgress, [0.35, 0.42], [0, 1]),
            transformOrigin: "left",
          }}
        />

        {/* Roof trusses */}
        <motion.g stroke={woodColor} strokeWidth="8" fill="none">
          <motion.line
            x1="145"
            y1="200"
            x2="400"
            y2="90"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.38, 0.45], [0, 1]) }}
          />
          <motion.line
            x1="655"
            y1="200"
            x2="400"
            y2="90"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.38, 0.45], [0, 1]) }}
          />
        </motion.g>

        {/* Cross bracing */}
        <motion.g stroke={woodColorLight} strokeWidth="4" fill="none">
          <motion.line
            x1="220"
            y1="200"
            x2="290"
            y2="300"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.4, 0.45], [0, 1]) }}
          />
          <motion.line
            x1="290"
            y1="200"
            x2="220"
            y2="300"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.4, 0.45], [0, 1]) }}
          />
          <motion.line
            x1="500"
            y1="200"
            x2="570"
            y2="300"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.42, 0.47], [0, 1]) }}
          />
          <motion.line
            x1="570"
            y1="200"
            x2="500"
            y2="300"
            initial={{ pathLength: 0 }}
            style={{ pathLength: useTransform(scrollProgress, [0.42, 0.47], [0, 1]) }}
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}
