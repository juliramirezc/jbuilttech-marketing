"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ConversionCta, useLeadModal } from "@/components/lead";

/**
 * ConsultationSection
 *
 * Final homepage CTA — drive lead form, stay on page.
 */
export function ConsultationSection() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openLeadModal } = useLeadModal();

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
      className="relative min-h-0 lg:min-h-[40vh] flex items-center justify-center bg-[#0a0a0a] pt-8 md:pt-10 lg:pt-12 pb-12 md:pb-16 lg:pb-20 overflow-hidden"
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
          Launch
        </motion.p>

        <motion.h2
          id="consultation-heading"
          className="text-editorial-display text-white mb-6"
          variants={fadeUpVariants}
        >
          Put Your Work Where{" "}
          <span className="text-gold-gradient">Homeowners Are Looking.</span>
        </motion.h2>

        <motion.p
          className="text-editorial-subheading max-w-2xl mx-auto mb-10 leading-relaxed"
          variants={fadeUpVariants}
        >
          Referrals built your business. Don&apos;t wait on the next one alone.
          Show the work you already do — and give the next homeowner a reason
          to call you first.
        </motion.p>

        <motion.div variants={buttonVariants}>
          <ConversionCta onClick={() => openLeadModal("consultation")}>
            GET MY COMPANY FOUND
          </ConversionCta>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#090909] to-transparent pointer-events-none" />
    </section>
  );
}
