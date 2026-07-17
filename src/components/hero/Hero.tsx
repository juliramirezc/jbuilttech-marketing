"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { HeroContent } from "./HeroContent";
import {
  BlueprintLayer,
  FramingLayer,
  FinishedHomeLayer,
  DigitalPresenceLayer,
} from "./layers";

/**
 * Hero Component
 * 
 * A cinematic, scroll-driven storytelling experience.
 * 
 * Story: Blueprint → Construction → Finished Home → Digital Presence
 * 
 * The visitor controls the narrative through scrolling.
 * Each phase transitions smoothly using masks, opacity, and transforms.
 * 
 * Scroll Timeline:
 * - 0-10%: Blueprint visible, architectural details
 * - 10-30%: Blueprint → Framing transition
 * - 30-55%: Framing → Finished home transition
 * - 55-70%: Home scales down, becomes website hero
 * - 70-100%: Digital ecosystem appears
 */

/**
 * Scroll runway:
 * - Mobile (<lg): 300vh — Blueprint → Digital Presence (no Framing / Finished Home)
 * - Desktop (lg+): 400vh — full Blueprint → Framing → Finished Home → Digital story
 */
export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Track scroll progress through the hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out scroll progress for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Vignette overlay intensifies during transitions
  const vignetteOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0.6, 0.7, 0.5, 0.6, 0.7]
  );

  // Scroll indicator fades out
  const scrollIndicatorOpacity = useTransform(
    smoothProgress,
    [0, 0.05],
    [1, 0]
  );

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] lg:h-[400vh]"
      aria-label="Hero section - Watch a contractor brand being built"
    >
      {/* Sticky viewport - stays fixed while user scrolls through */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#090909]">
        {/* Image layers - stacked, each with its own scroll-driven animation */}
        <div className="absolute inset-0">
          <BlueprintLayer
            scrollProgress={smoothProgress}
            reducedMotion={prefersReducedMotion}
          />
          <FramingLayer
            scrollProgress={smoothProgress}
            reducedMotion={prefersReducedMotion}
          />
          <FinishedHomeLayer
            scrollProgress={smoothProgress}
            reducedMotion={prefersReducedMotion}
          />
          <DigitalPresenceLayer
            scrollProgress={smoothProgress}
            reducedMotion={prefersReducedMotion}
          />
        </div>

        {/* Cinematic vignette overlays */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ opacity: vignetteOpacity }}
        >
          {/* Bottom gradient - grounds the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/30 to-transparent" />
          
          {/* Top gradient - subtle */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/50 via-transparent to-transparent" />
          
          {/* Radial vignette - cinematic focus */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, #090909 100%)",
              opacity: 0.4,
            }}
          />
        </motion.div>

        {/* Text content - fades as visual story takes over */}
        <HeroContent
          scrollProgress={smoothProgress}
          reducedMotion={prefersReducedMotion}
        />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-white/40">
            Scroll to explore
          </span>
          <motion.div
            className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent origin-top"
            animate={
              prefersReducedMotion
                ? {}
                : { scaleY: [1, 0.3, 1] }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Progress phases indicator */}
        <PhaseIndicator
          scrollProgress={smoothProgress}
          reducedMotion={prefersReducedMotion}
        />
      </div>
    </section>
  );
}

/**
 * Phase indicator showing current stage of the story
 */
function PhaseIndicator({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress: ReturnType<typeof useSpring>;
  reducedMotion: boolean;
}) {
  const phases = [
    { label: "Blueprint", end: 0.25 },
    { label: "Build", end: 0.5 },
    { label: "Finish", end: 0.7 },
    { label: "Launch", end: 1 },
  ];

  // Only show after initial scroll
  const containerOpacity = useTransform(
    scrollProgress,
    [0, 0.08, 0.9, 1],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      className="absolute bottom-8 right-8 hidden md:flex items-center gap-3 z-20"
      style={{ opacity: containerOpacity }}
    >
      {phases.map((phase, i) => {
        const prevEnd = i === 0 ? 0 : phases[i - 1].end;
        
        // Calculate if this phase is active
        const isActive = useTransform(
          scrollProgress,
          [prevEnd, phase.end],
          [0.4, 1]
        );

        return (
          <motion.div
            key={phase.label}
            className="flex items-center gap-2"
            style={{ opacity: isActive }}
          >
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/70">
              {phase.label}
            </span>
            {i < phases.length - 1 && (
              <div className="w-6 h-[1px] bg-gradient-to-r from-gold to-gold/30" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
