"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

interface AnalyticsMockupProps {
  imageSrc: string;
  imageAlt: string;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * AnalyticsMockup
 * 
 * Premium browser window mockup containing the Facebook Insights screenshot.
 * Creates the illusion of looking at a real business dashboard.
 * 
 * Design:
 * - macOS-style browser chrome with traffic lights
 * - URL bar showing facebook.com/insights
 * - Subtle shadow and glow for depth
 * - Screenshot fills the viewport area
 * 
 * Animation:
 * - Fades and slides up on scroll
 * - Slight scale animation for premium feel
 */
export const AnalyticsMockup = memo(function AnalyticsMockup({
  imageSrc,
  imageAlt,
  scrollProgress,
  reducedMotion,
}: AnalyticsMockupProps) {
  // Browser window animation — settles by ~22%
  const browserOpacity = useTransform(
    scrollProgress,
    [0.14, 0.20],
    [0, 1]
  );

  const browserY = useTransform(
    scrollProgress,
    [0.14, 0.22],
    reducedMotion ? [0, 0] : [60, 0]
  );

  const browserScale = useTransform(
    scrollProgress,
    [0.14, 0.22],
    reducedMotion ? [1, 1] : [0.95, 1]
  );

  return (
    <motion.div
      className="relative w-full max-w-5xl mx-auto"
      style={{
        opacity: browserOpacity,
        y: browserY,
        scale: browserScale,
      }}
    >
      {/* Glow effect behind browser */}
      <div className="absolute inset-0 -m-8 bg-[rgb(59,130,180)]/5 blur-3xl rounded-3xl opacity-40" />

      {/* Browser window */}
      <div className="relative rounded-xl overflow-hidden border border-white/[0.1] shadow-2xl shadow-black/50 bg-[#1a1a1a]">
        {/* Browser chrome - top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#2a2a2a] border-b border-white/[0.06]">
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>

          {/* URL bar */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#1a1a1a] border border-white/[0.08] max-w-md w-full">
              {/* Lock icon */}
              <svg
                className="w-3.5 h-3.5 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-xs text-white/50 font-light tracking-wide">
                business.facebook.com/insights
              </span>
            </div>
          </div>

          {/* Browser actions placeholder */}
          <div className="w-[52px]" />
        </div>

        {/* Screenshot viewport */}
        <div className="relative">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={650}
            quality={95}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />

          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1a1a1a]/20 via-transparent to-transparent" />
        </div>
      </div>
    </motion.div>
  );
});