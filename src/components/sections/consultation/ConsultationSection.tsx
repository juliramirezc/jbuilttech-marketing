"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { getExternalLinkProps, CALENDLY_BOOKING_URL } from "@/lib/links";

/**
 * ConsultationSection
 *
 * Final homepage CTA — spacious conclusion to the site story.
 */
export function ConsultationSection() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.14,
      },
    },
  };

  const fadeUpVariants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.92,
      y: reducedMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 180,
        damping: 18,
        mass: 0.8,
      },
    },
  };

  return (
    <section
      ref={ref}
      id="consultation"
      className="relative min-h-[50vh] flex items-center justify-center bg-[#0a0a0a] pt-10 md:pt-12 lg:pt-14 pb-16 md:pb-20 lg:pb-24 overflow-hidden"
      aria-labelledby="consultation-heading"
    >
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#090909] to-transparent pointer-events-none" />

      <motion.div
        className="container-luxury text-center max-w-3xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.p
          className="text-editorial-caption text-gold mb-6"
          variants={fadeUpVariants}
        >
          Ready to build?
        </motion.p>

        <motion.h2
          id="consultation-heading"
          className="text-editorial-display text-white mb-8"
          variants={fadeUpVariants}
        >
          Let&apos;s Build Something{" "}
          <span className="text-gold-gradient">Remarkable.</span>
        </motion.h2>

        <motion.p
          className="text-editorial-subheading max-w-2xl mx-auto mb-10 leading-relaxed"
          variants={fadeUpVariants}
        >
          Book a free consultation and discover how we can transform your
          contractor business into a premium brand that earns trust, stands out
          online, and wins more projects.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <motion.a
            href={CALENDLY_BOOKING_URL}
            className="btn-primary"
            variants={buttonVariants}
            data-consultation-trigger
            {...getExternalLinkProps()}
          >
            Book My Free Consultation
          </motion.a>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none" />
    </section>
  );
}
