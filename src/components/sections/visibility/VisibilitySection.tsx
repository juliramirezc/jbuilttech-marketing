"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { AnalyticsMockup } from "./AnalyticsMockup";
import { MetricCard } from "./MetricCard";
import { PhoneMockup } from "./PhoneMockup";
import { SocialCard } from "./SocialCard";
import {
  VISIBILITY_SECTION_HEIGHT_VH,
} from "./constants";

/**
 * Premium icons for metric cards
 */
const ReachIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const EngagementIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ViewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ClicksIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

/**
 * Configurable metrics
 * Values pulled from actual Facebook Insights
 */
const METRICS = [
  {
    id: 1,
    value: 34800,
    label: "People Reached",
    icon: <ReachIcon />,
  },
  {
    id: 2,
    value: 141,
    label: "Engagements",
    icon: <EngagementIcon />,
  },
  {
    id: 3,
    value: 17300,
    label: "Video Views",
    icon: <ViewsIcon />,
  },
  {
    id: 4,
    value: 329,
    label: "Website Clicks",
    icon: <ClicksIcon />,
  },
];

const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "google-business",
  "google-reviews",
] as const;

/**
 * VisibilitySection
 * 
 * Premium storytelling section that shows what happens after JBuiltTech
 * builds a contractor's brand: their business becomes more visible.
 * 
 * Architecture:
 * - Section header with minimal copy
 * - Analytics mockup (browser window with Facebook Insights)
 * - Animated metric cards counting up
 * - Social presence cards appearing
 * - Phone mockup with live notifications
 * 
 * Scroll Timeline (normalized 0-1, pinned offset):
 * 0.04-0.07: Caption appears
 * 0.06-0.10: Headline appears
 * 0.10-0.14: Supporting text appears
 * 0.14-0.22: Browser window fades up with screenshot
 * 0.22:     Insights complete → phone sequence (time-based)
 * 0.22-0.34: Metric cards reveal sequentially
 * 0.36-0.46: Social cards fade in
 * 0.72-1.00: Final composition holds — no new animations
 * 
 * Visual Goal:
 * The contractor watches their business become visible online.
 * Everything feels connected and alive.
 */
export function VisibilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Track scroll progress through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Caption — appears just before headline
  const captionOpacity = useTransform(
    scrollYProgress,
    [0.04, 0.07],
    [0, 1]
  );

  const captionY = useTransform(
    scrollYProgress,
    [0.04, 0.07],
    reducedMotion ? [0, 0] : [20, 0]
  );

  // Headline
  const headlineOpacity = useTransform(
    scrollYProgress,
    [0.06, 0.10],
    [0, 1]
  );

  const headlineY = useTransform(
    scrollYProgress,
    [0.06, 0.10],
    reducedMotion ? [0, 0] : [25, 0]
  );

  // Supporting text
  const supportingOpacity = useTransform(
    scrollYProgress,
    [0.10, 0.14],
    [0, 1]
  );

  const supportingY = useTransform(
    scrollYProgress,
    [0.10, 0.14],
    reducedMotion ? [0, 0] : [20, 0]
  );

  return (
    <section
      ref={sectionRef}
      id="visibility"
      className="relative pt-10 md:pt-12 lg:pt-14 pb-6 md:pb-8 lg:pb-10 bg-[#090909] overflow-hidden"
      aria-labelledby="visibility-heading"
      style={{ minHeight: `${VISIBILITY_SECTION_HEIGHT_VH}vh` }}
    >
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />

      {/* Sticky container for scroll-driven content */}
      <div className="sticky top-0 min-h-screen flex flex-col justify-center py-8 md:py-10">
        <div className="container-luxury relative z-10">
          {/* Section Header - Minimal */}
          <div className="text-center mb-8 md:mb-10">
            <motion.p
              className="text-editorial-caption text-gold mb-4"
              style={{ opacity: captionOpacity, y: captionY }}
            >
              After We Build Your Brand
            </motion.p>
            <motion.h2
              id="visibility-heading"
              className="text-editorial-display text-white mb-4"
              style={{ opacity: headlineOpacity, y: headlineY }}
            >
              YOUR WORK.
              <br />
              <span className="text-gold-gradient">Deserves More Attention.</span>
            </motion.h2>
            <motion.p
              className="text-editorial-subheading max-w-xl mx-auto"
              style={{ opacity: supportingOpacity, y: supportingY }}
            >
              Homeowners research contractors before making a phone call.
              Consistent branding keeps your business visible, memorable, and trusted.
            </motion.p>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left column: Analytics + Metrics */}
            <div className="lg:col-span-7 space-y-8">
              {/* Analytics Mockup */}
              <AnalyticsMockup
                imageSrc="/images/visibility/facebook-insights.png"
                imageAlt="Facebook Business Page insights showing performance overview with content interactions, link clicks, views, viewers, and goals achieved"
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
              />

              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {METRICS.map((metric, index) => (
                  <MetricCard
                    key={metric.id}
                    value={metric.value}
                    label={metric.label}
                    icon={metric.icon}
                    index={index}
                    scrollProgress={scrollYProgress}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>

              {/* Social Cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {SOCIAL_PLATFORMS.map((platform, index) => (
                  <SocialCard
                    key={platform}
                    platform={platform}
                    scrollProgress={scrollYProgress}
                    index={index}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </div>

            {/* Right column: Phone Mockup — desktop only (lg+) */}
            <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end">
              <PhoneMockup
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}