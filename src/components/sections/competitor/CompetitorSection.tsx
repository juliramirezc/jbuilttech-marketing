"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ConversionCta, useLeadModal } from "@/components/lead";

/**
 * Desktop competitor conversion block — escalation from Blueprint problem.
 */
export function CompetitorSection() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openLeadModal } = useLeadModal();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative hidden lg:block bg-[#090909] py-14 xl:py-16 overflow-hidden"
      aria-labelledby="competitor-heading"
    >
      <div className="container-luxury relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2
            id="competitor-heading"
            className="text-editorial-display text-white mb-8"
            variants={fadeUp}
          >
            BEING BETTER ISN&apos;T ENOUGH.
          </motion.h2>

          <motion.div
            className="space-y-3 text-lg text-white/75 font-light leading-relaxed mb-6"
            variants={fadeUp}
          >
            <p>You know the guy.</p>
            <p>His work isn&apos;t better than yours.</p>
            <p>His crew isn&apos;t better than yours.</p>
            <p>He doesn&apos;t care more about the homeowner than you do.</p>
            <p className="text-white font-medium pt-2">
              But somehow his phone keeps ringing.
            </p>
          </motion.div>

          <motion.p
            className="text-2xl xl:text-3xl font-semibold text-gold tracking-tight mb-5"
            variants={fadeUp}
          >
            Maybe he&apos;s just easier to find.
          </motion.p>

          <motion.p
            className="text-lg text-white/80 font-light leading-relaxed mb-5 max-w-2xl mx-auto"
            variants={fadeUp}
          >
            And if a homeowner sees his work before they see yours,{" "}
            <strong className="text-white font-semibold">
              he gets the chance to win the job first.
            </strong>
          </motion.p>

          <motion.p
            className="text-2xl xl:text-3xl font-semibold text-white tracking-tight mb-8"
            variants={fadeUp}
          >
            Stop giving that advantage away.
          </motion.p>

          <motion.div variants={fadeUp}>
            <ConversionCta onClick={() => openLeadModal("competitor_section")}>
              GET MY COMPANY FOUND
            </ConversionCta>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
