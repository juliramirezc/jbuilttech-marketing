"use client";

import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ProcessTimeline } from "./ProcessTimeline";
import { ProcessSectionMobile } from "./ProcessSectionMobile";
import { type ProcessStep } from "./ProcessCard";

/**
 * Premium SVG icons for each process step
 * Designed to match the blueprint/engineering aesthetic
 */
const BlueprintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <path d="M14 14l2 2 4-4" />
  </svg>
);

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
    <path d="M8 12h8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M2 8h20" />
    <circle cx="5" cy="6" r="0.5" fill="currentColor" />
    <circle cx="7.5" cy="6" r="0.5" fill="currentColor" />
    <circle cx="10" cy="6" r="0.5" fill="currentColor" />
    <path d="M6 12h4" />
    <path d="M6 15h8" />
    <rect x="14" y="11" width="4" height="5" rx="0.5" />
  </svg>
);

const GrowthIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M17 7h4v4" />
    <path d="M3 21h18" />
  </svg>
);

/**
 * Process steps data
 * Each step maps to a phase in the contractor brand-building journey
 */
const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: "Blueprint",
    description:
      "You already do good work. We map where homeowners look — and where your company is invisible.",
    icon: <BlueprintIcon />,
  },
  {
    id: 2,
    title: "Build",
    description:
      "We put your real projects where homeowners search, click, and call.",
    icon: <BrandIcon />,
  },
  {
    id: 3,
    title: "Finish",
    description:
      "Your website, profiles, and content show the quality of your crew before the first call.",
    icon: <WebsiteIcon />,
  },
  {
    id: 4,
    title: "Launch",
    description:
      "More homeowners find you. More chances to win the next job.",
    icon: <GrowthIcon />,
  },
];

/**
 * ProcessSection
 * 
 * Main orchestrator component for the "We Build Your Brand" section.
 * 
 * Architecture:
 * - Uses scroll-driven animations tied to section visibility
 * - SectionHeader handles title/description with staggered reveals
 * - ProcessTimeline manages cards and blueprint connector
 * 
 * Scroll Strategy:
 * - Section spans 150vh to give enough scroll distance for animations
 * - Line progress (0-1) drives all child animations
 * - Cards reveal sequentially as line reaches them
 * 
 * Performance:
 * - GPU-accelerated transforms only
 * - useReducedMotion support
 * - Memoized components prevent unnecessary re-renders
 */
export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Track scroll progress through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress to line drawing progress
  // Line starts drawing when section is 30% in view
  // Completes when section is 80% scrolled through
  const lineProgress = useTransform(
    scrollYProgress,
    [0.2, 0.7],
    [0, 1]
  );

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-8 md:py-10 lg:py-14 bg-[#090909] overflow-hidden"
      aria-labelledby="process-heading"
    >
      {/* Subtle top fade from Hero */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />

      <div className="container-luxury relative z-10">
        <div className="hidden lg:block">
          <SectionHeader
            caption="How we help"
            title="You Already Did the Work. Now Get Found."
            titleHighlight="Get Found"
            description="We don't ask you to become a marketer. We help homeowners see the jobs you already finish — so your company gets the next opportunity."
            reducedMotion={reducedMotion}
          />

          <ProcessTimeline
            steps={PROCESS_STEPS}
            lineProgress={lineProgress}
            reducedMotion={reducedMotion}
          />
        </div>

        <ProcessSectionMobile />
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}