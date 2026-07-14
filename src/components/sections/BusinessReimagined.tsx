"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
} from "framer-motion";
import Image from "next/image";

/**
 * BusinessReimagined Section
 * 
 * Continues the story after the Hero.
 * Shows the digital mockups prominently and invites contractors
 * to imagine their business with the same premium treatment.
 * 
 * Emotional goal: "I want my company to look like this."
 */

export function BusinessReimagined() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  // Parallax for the mockups
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle floating effect on mockups
  const mockupY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [40, -40]
  );

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#090909] overflow-hidden"
      aria-labelledby="reimagined-heading"
    >
      {/* Background: Digital mockups - centered and prominent */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ y: mockupY }}
      >
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <Image
            src="/images/hero/digital-mockups.png"
            alt="Premium contractor website on laptop, Instagram profile on phone, and Facebook business page"
            width={1400}
            height={500}
            quality={95}
            className="object-contain w-full h-auto"
            unoptimized
          />
        </div>
      </motion.div>

      {/* Left gradient overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to right,
            rgba(9, 9, 9, 0.92) 0%,
            rgba(9, 9, 9, 0.85) 20%,
            rgba(9, 9, 9, 0.6) 40%,
            rgba(9, 9, 9, 0.25) 60%,
            transparent 80%
          )`,
        }}
      />

      {/* Subtle bottom gradient for grounding */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#090909] via-transparent to-transparent opacity-60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container-luxury py-24 lg:py-32">
          <motion.div
            className="max-w-xl"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Badge */}
            <motion.p
              className="text-editorial-caption text-gold mb-6"
              variants={itemVariants}
            >
              Your Business. Reimagined.
            </motion.p>

            {/* Headline */}
            <motion.h2
              id="reimagined-heading"
              className="text-editorial-display text-white mb-6"
              variants={itemVariants}
            >
              This Could Be
              <br />
              <span className="text-gold-gradient">Your Business.</span>
            </motion.h2>

            {/* Supporting text */}
            <motion.p
              className="text-editorial-subheading mb-4"
              variants={itemVariants}
            >
              Every homeowner looks online before making a decision.
            </motion.p>

            <motion.p
              className="text-editorial-body text-white/60 mb-10"
              variants={itemVariants}
            >
              Professional branding, a premium website, consistent social media, 
              and a business that builds trust before the first phone call.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-4"
              variants={buttonVariants}
            >
              <a
                href="#consultation"
                className="btn-primary"
                data-calendly-trigger
              >
                Start Building My Brand
              </a>
              
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                See More Transformations
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
