"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

/**
 * FinishedHomeScene
 * 
 * Phase 3 of the Hero experience.
 * Shows the completed luxury home with exterior finishes.
 */

interface FinishedHomeSceneProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

export function FinishedHomeScene({ scrollProgress, className }: FinishedHomeSceneProps) {
  const opacity = useTransform(scrollProgress, [0.45, 0.55, 0.75, 0.85], [0, 1, 1, 0]);
  const materialsProgress = useTransform(scrollProgress, [0.5, 0.75], [0, 1]);

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
        {/* Sky gradient background */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4B5563" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>

        {/* Ground/Lawn */}
        <motion.rect
          x="0"
          y="400"
          width="800"
          height="100"
          fill="#1B4332"
          initial={{ opacity: 0 }}
          style={{ opacity: materialsProgress }}
        />

        {/* Driveway */}
        <motion.path
          d="M 300 500 L 350 400 L 450 400 L 500 500 Z"
          fill="#4B5563"
          initial={{ opacity: 0 }}
          style={{ opacity: materialsProgress }}
        />

        {/* Main house body */}
        <motion.rect
          x="150"
          y="200"
          width="500"
          height="200"
          fill="url(#wallGradient)"
          initial={{ opacity: 0 }}
          style={{ opacity: materialsProgress }}
        />

        {/* Roof */}
        <motion.path
          d="M 130 200 L 400 70 L 670 200 Z"
          fill="url(#roofGradient)"
          initial={{ opacity: 0 }}
          style={{ opacity: materialsProgress }}
        />

        {/* Windows with warm interior glow */}
        <motion.g initial={{ opacity: 0 }} style={{ opacity: materialsProgress }}>
          {/* Left window */}
          <rect x="200" y="250" width="80" height="80" fill="#1E293B" />
          <motion.rect
            x="205"
            y="255"
            width="70"
            height="70"
            fill="#FEF3C7"
            initial={{ opacity: 0 }}
            style={{ opacity: useTransform(scrollProgress, [0.6, 0.7], [0, 0.8]) }}
          />
          <line x1="240" y1="250" x2="240" y2="330" stroke="#374151" strokeWidth="3" />
          <line x1="200" y1="290" x2="280" y2="290" stroke="#374151" strokeWidth="3" />

          {/* Right window */}
          <rect x="520" y="250" width="80" height="80" fill="#1E293B" />
          <motion.rect
            x="525"
            y="255"
            width="70"
            height="70"
            fill="#FEF3C7"
            initial={{ opacity: 0 }}
            style={{ opacity: useTransform(scrollProgress, [0.62, 0.72], [0, 0.8]) }}
          />
          <line x1="560" y1="250" x2="560" y2="330" stroke="#374151" strokeWidth="3" />
          <line x1="520" y1="290" x2="600" y2="290" stroke="#374151" strokeWidth="3" />
        </motion.g>

        {/* Front door */}
        <motion.g initial={{ opacity: 0 }} style={{ opacity: materialsProgress }}>
          <rect x="360" y="280" width="80" height="120" fill="#78350F" />
          <circle cx="425" cy="345" r="5" fill="#FCD34D" />
        </motion.g>

        {/* Porch light */}
        <motion.circle
          cx="340"
          cy="260"
          r="8"
          fill="#FCD34D"
          initial={{ opacity: 0 }}
          style={{ opacity: useTransform(scrollProgress, [0.65, 0.75], [0, 1]) }}
        />

        {/* Landscaping - bushes */}
        <motion.g initial={{ opacity: 0 }} style={{ opacity: materialsProgress }}>
          <ellipse cx="180" cy="395" rx="40" ry="25" fill="#166534" />
          <ellipse cx="620" cy="395" rx="40" ry="25" fill="#166534" />
          <ellipse cx="250" cy="398" rx="30" ry="20" fill="#15803D" />
          <ellipse cx="550" cy="398" rx="30" ry="20" fill="#15803D" />
        </motion.g>

        {/* Stars in sky */}
        <motion.g
          fill="#FFF"
          initial={{ opacity: 0 }}
          style={{ opacity: useTransform(scrollProgress, [0.55, 0.65], [0, 0.6]) }}
        >
          <circle cx="100" cy="50" r="1" />
          <circle cx="200" cy="30" r="1.5" />
          <circle cx="350" cy="45" r="1" />
          <circle cx="500" cy="25" r="1.5" />
          <circle cx="650" cy="55" r="1" />
          <circle cx="750" cy="35" r="1" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
