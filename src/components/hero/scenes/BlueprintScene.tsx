"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, type MotionValue, useTransform } from "framer-motion";

/**
 * BlueprintScene
 * 
 * Phase 1 of the Hero experience.
 * A detailed architectural blueprint with measurements, grid lines,
 * and technical annotations that draws itself on load.
 */

interface BlueprintSceneProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

export function BlueprintScene({ scrollProgress, className }: BlueprintSceneProps) {
  const prefersReducedMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  const opacity = useTransform(scrollProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.2], [1, 1.05]);

  useEffect(() => {
    const timer = setTimeout(() => setIsDrawn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const strokeColor = "rgb(59, 158, 206)";
  const strokeColorMuted = "rgba(59, 158, 206, 0.4)";

  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center ${className || ""}`}
      style={{ opacity, scale }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 800 500"
        className="w-full max-w-4xl h-auto"
        style={{ overflow: "visible" }}
      >
        {/* Grid reference lines */}
        <g stroke={strokeColorMuted} strokeWidth="0.5" fill="none">
          {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="500" strokeDasharray="4,4" />
          ))}
          {[0, 100, 200, 300, 400, 500].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="800" y2={y} strokeDasharray="4,4" />
          ))}
        </g>

        {/* Main house outline */}
        <motion.g
          stroke={strokeColor}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isDrawn ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 2, ease: "easeOut" }}
        >
          {/* Foundation */}
          <motion.rect
            x="150"
            y="380"
            width="500"
            height="20"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 1, delay: 0.2 }}
          />

          {/* Left wall */}
          <motion.line
            x1="150"
            y1="380"
            x2="150"
            y2="200"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.5 }}
          />

          {/* Right wall */}
          <motion.line
            x1="650"
            y1="380"
            x2="650"
            y2="200"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.5 }}
          />

          {/* Roof left */}
          <motion.line
            x1="150"
            y1="200"
            x2="400"
            y2="80"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 1 }}
          />

          {/* Roof right */}
          <motion.line
            x1="650"
            y1="200"
            x2="400"
            y2="80"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 1 }}
          />

          {/* Windows */}
          <motion.rect
            x="200"
            y="250"
            width="80"
            height="80"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 1.3 }}
          />
          <motion.rect
            x="520"
            y="250"
            width="80"
            height="80"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 1.4 }}
          />

          {/* Door */}
          <motion.rect
            x="360"
            y="280"
            width="80"
            height="100"
            initial={{ pathLength: 0 }}
            animate={isDrawn ? { pathLength: 1 } : {}}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 1.5 }}
          />
        </motion.g>

        {/* Dimension lines */}
        <motion.g
          stroke={strokeColorMuted}
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0 }}
          animate={isDrawn ? { opacity: 1 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 1.8 }}
        >
          {/* Width dimension */}
          <line x1="150" y1="430" x2="650" y2="430" />
          <line x1="150" y1="420" x2="150" y2="440" />
          <line x1="650" y1="420" x2="650" y2="440" />

          {/* Height dimension */}
          <line x1="700" y1="80" x2="700" y2="380" />
          <line x1="690" y1="80" x2="710" y2="80" />
          <line x1="690" y1="380" x2="710" y2="380" />
        </motion.g>

        {/* Dimension text */}
        <motion.g
          fill={strokeColor}
          fontSize="12"
          fontFamily="monospace"
          initial={{ opacity: 0 }}
          animate={isDrawn ? { opacity: 1 } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 2 }}
        >
          <text x="400" y="450" textAnchor="middle">50&apos;-0&quot;</text>
          <text x="720" y="230" textAnchor="start">30&apos;-0&quot;</text>
          <text x="400" y="60" textAnchor="middle" fontSize="14" fontWeight="bold">
            FRONT ELEVATION
          </text>
          <text x="400" y="480" textAnchor="middle" fontSize="10">
            SCALE: 1/4&quot; = 1&apos;-0&quot;
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
}
