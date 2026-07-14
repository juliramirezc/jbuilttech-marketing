"use client";

import { memo } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { CALENDLY_BOOKING_URL, getExternalLinkProps } from "@/lib/links";

interface DigitalPresenceLayerProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * DigitalPresenceLayer
 * 
 * PHASE 5 - Grand Finale: Digital mockups become the FINAL visual reveal
 * 
 * Timeline:
 * - 65-80%: Mockups animate into view (opacity, scale, Y position)
 * - 80-88%: Mockups fully settled - visitor appreciates the completed brand
 * - 88-91%: Glass panel fades in behind text area
 * - 91-94%: Headline fades upward
 * - 94-96%: Supporting text appears
 * - 96-100%: Button animates with spring feel
 * 
 * Emotional goal: "I want my company to look exactly like this."
 */
export const DigitalPresenceLayer = memo(function DigitalPresenceLayer({
  scrollProgress,
  reducedMotion,
}: DigitalPresenceLayerProps) {
  // ═══════════════════════════════════════════════════════════════════
  // MOCKUPS ANIMATION (65-80% scroll)
  // The digital mockups are the FINAL visual reveal
  // ═══════════════════════════════════════════════════════════════════
  
  const mockupsOpacity = useTransform(
    scrollProgress,
    [0.65, 0.75],
    [0, 1]
  );

  const mockupsScale = useTransform(
    scrollProgress,
    [0.65, 0.80],
    reducedMotion ? [1, 1] : [0.92, 1]
  );

  const mockupsY = useTransform(
    scrollProgress,
    [0.65, 0.80],
    reducedMotion ? ["0%", "0%"] : ["8%", "0%"]
  );

  // ═══════════════════════════════════════════════════════════════════
  // GLASS PANEL (88-91% scroll)
  // Fades in AFTER mockups have settled (~300ms pause equivalent)
  // Only behind text, NOT full screen
  // ═══════════════════════════════════════════════════════════════════
  
  const panelOpacity = useTransform(
    scrollProgress,
    [0.88, 0.91],
    [0, 1]
  );

  const panelScale = useTransform(
    scrollProgress,
    [0.88, 0.91],
    reducedMotion ? [1, 1] : [0.97, 1]
  );

  // ═══════════════════════════════════════════════════════════════════
  // HEADLINE (91-94% scroll)
  // Fades upward after glass panel
  // ═══════════════════════════════════════════════════════════════════
  
  const headlineOpacity = useTransform(
    scrollProgress,
    [0.91, 0.94],
    [0, 1]
  );

  const headlineY = useTransform(
    scrollProgress,
    [0.91, 0.94],
    reducedMotion ? [0, 0] : [18, 0]
  );

  // ═══════════════════════════════════════════════════════════════════
  // SUPPORTING TEXT (94-96% scroll)
  // Appears ~120ms after headline
  // ═══════════════════════════════════════════════════════════════════
  
  const supportingOpacity = useTransform(
    scrollProgress,
    [0.94, 0.96],
    [0, 1]
  );

  const supportingY = useTransform(
    scrollProgress,
    [0.94, 0.96],
    reducedMotion ? [0, 0] : [14, 0]
  );

  // ═══════════════════════════════════════════════════════════════════
  // BUTTON (96-100% scroll)
  // Spring animation: scale 0.82→1, Y 20→0, blur 6→0
  // Animates ONCE, then remains still
  // ═══════════════════════════════════════════════════════════════════
  
  const buttonOpacity = useTransform(
    scrollProgress,
    [0.96, 1.0],
    [0, 1]
  );

  const buttonY = useTransform(
    scrollProgress,
    [0.96, 1.0],
    reducedMotion ? [0, 0] : [20, 0]
  );

  const buttonScale = useTransform(
    scrollProgress,
    [0.96, 1.0],
    reducedMotion ? [1, 1] : [0.82, 1]
  );

  const buttonBlur = useTransform(
    scrollProgress,
    [0.96, 0.99],
    reducedMotion ? [0, 0] : [6, 0]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center will-change-transform"
      style={{
        opacity: mockupsOpacity,
      }}
    >
      {/* Digital mockups - THE FINAL VISUAL REVEAL */}
      <motion.div
        className="relative w-full max-w-6xl mx-auto px-8"
        style={{
          scale: mockupsScale,
          y: mockupsY,
        }}
      >
        <Image
          src="/images/hero/digital-mockups.png"
          alt="Contractor digital presence: website on laptop, social media on phone, Facebook business page"
          width={1400}
          height={500}
          quality={95}
          className="object-contain"
          priority
          unoptimized
        />
      </motion.div>

      {/* CTA Overlay - positioned ON TOP of mockups, centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Premium glass panel - only behind text and button */}
          <motion.div
            className="absolute -inset-x-10 sm:-inset-x-14 md:-inset-x-20 -inset-y-8 sm:-inset-y-10 md:-inset-y-14"
            style={{
              opacity: panelOpacity,
              scale: panelScale,
              backgroundColor: "rgba(8, 12, 20, 0.42)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 30px 90px rgba(0, 0, 0, 0.35)",
            }}
          />

          {/* Text content - centered on top of mockups */}
          <div className="relative z-10 text-center px-6 py-4 pointer-events-auto">
            {/* Headline */}
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-5 tracking-tight"
              style={{
                opacity: headlineOpacity,
                y: headlineY,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              This Could Be{" "}
              <span className="text-gold-gradient">Your Business.</span>
            </motion.h2>

            {/* Supporting text */}
            <motion.div
              style={{
                opacity: supportingOpacity,
                y: supportingY,
              }}
            >
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2 font-light">
                You already build incredible projects.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-white/70 mb-10 font-light max-w-lg mx-auto leading-relaxed">
                Now build a brand that homeowners trust before they ever call.
              </p>
            </motion.div>

            {/* Primary CTA Button - spring animation */}
            <motion.div
              style={{
                opacity: buttonOpacity,
                y: buttonY,
                scale: buttonScale,
                filter: useTransform(buttonBlur, (v) => `blur(${v}px)`),
              }}
            >
              <a
                href={CALENDLY_BOOKING_URL}
                className="hero-final-cta"
                data-calendly-trigger
                {...getExternalLinkProps()}
              >
                Build My Brand
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});