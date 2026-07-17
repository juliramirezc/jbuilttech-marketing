"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { pushConsultationBookedEvent } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

const NEXT_STEPS = [
  {
    id: 1,
    title: "Business Review",
    description:
      "We'll review your company, website, branding and online presence before the meeting.",
  },
  {
    id: 2,
    title: "Strategy Session",
    description:
      "We'll discuss your goals, identify opportunities and build a custom marketing strategy.",
  },
  {
    id: 3,
    title: "Growth Blueprint",
    description:
      "You'll receive expert recommendations designed specifically for your contracting business.",
  },
] as const;

function SuccessCheckIcon({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="relative mx-auto mb-10 flex h-24 w-24 items-center justify-center"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.7,
        ease: EASE,
        delay: reducedMotion ? 0 : 0.1,
      }}
    >
      {/* Soft floating glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: "rgb(var(--color-gold) / 0.2)" }}
        aria-hidden="true"
        animate={
          reducedMotion
            ? {}
            : {
                scale: [1, 1.15, 1],
                opacity: [0.45, 0.7, 0.45],
              }
        }
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          border: "1px solid rgb(var(--color-gold) / 0.35)",
          backgroundColor: "rgb(var(--color-gold) / 0.08)",
          boxShadow: "0 0 40px rgb(var(--color-gold) / 0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <svg
          viewBox="0 0 48 48"
          className="h-10 w-10"
          fill="none"
          aria-hidden="true"
        >
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgb(var(--color-gold))"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.8,
              ease: EASE,
              delay: reducedMotion ? 0 : 0.2,
            }}
          />
          <motion.path
            d="M14 24.5 L21 31.5 L34 17"
            stroke="rgb(var(--color-gold-light))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.55,
              ease: EASE,
              delay: reducedMotion ? 0 : 0.55,
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

function BlueprintGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 180, 0.55) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 180, 0.55) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

function AmbientGlow({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ backgroundColor: "rgb(var(--color-gold) / 0.08)" }}
        animate={
          reducedMotion
            ? {}
            : {
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.08, 1],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-[-10%] h-[320px] w-[320px] rounded-full blur-[100px]"
        style={{ backgroundColor: "rgb(var(--color-blueprint) / 0.08)" }}
        animate={
          reducedMotion
            ? {}
            : {
                opacity: [0.3, 0.55, 0.3],
                x: [0, -20, 0],
              }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 left-[-8%] h-[260px] w-[260px] rounded-full blur-[90px]"
        style={{ backgroundColor: "rgb(var(--color-gold) / 0.05)" }}
        animate={
          reducedMotion
            ? {}
            : {
                opacity: [0.25, 0.5, 0.25],
                y: [0, -16, 0],
              }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/**
 * ThankYouContent
 *
 * Premium conversion confirmation experience after Calendly booking.
 */
export function ThankYouContent() {
  const reducedMotion = useReducedMotion() ?? false;
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });

  // GTM conversion event — fires exactly once per thank-you page load
  useEffect(() => {
    pushConsultationBookedEvent();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.12,
      },
    },
  };

  const fadeUpVariants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 24,
      scale: reducedMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.65,
        ease: EASE,
      },
    },
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#090909]"
      data-page="thank-you"
      data-conversion="consultation_booked"
      data-conversion-source="calendly"
    >
      <BlueprintGrid />
      <AmbientGlow reducedMotion={reducedMotion} />

      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

      <div className="container-luxury relative z-10 py-16 md:py-20 lg:py-28">
        {/* Hero confirmation */}
        <motion.section
          className="mx-auto max-w-2xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="thank-you-heading"
        >
          <SuccessCheckIcon reducedMotion={reducedMotion} />

          <motion.p
            className="text-editorial-caption text-gold mb-4"
            variants={fadeUpVariants}
          >
            Consultation Confirmed
          </motion.p>

          <motion.h1
            id="thank-you-heading"
            className="text-editorial-display text-white mb-5"
            variants={fadeUpVariants}
          >
            Thank You!
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/85 font-light mb-6"
            variants={fadeUpVariants}
          >
            Your consultation has been scheduled successfully.
          </motion.p>

          <motion.p
            className="text-editorial-subheading max-w-xl mx-auto leading-relaxed"
            variants={fadeUpVariants}
          >
            We&apos;ll review your business before our meeting and come prepared
            with ideas tailored to your goals.
            <br />
            <br />
            In the meantime, check your email for the meeting confirmation.
          </motion.p>
        </motion.section>

        {/* What Happens Next */}
        <motion.section
          ref={stepsRef}
          className="mx-auto mt-16 md:mt-20 max-w-5xl"
          aria-labelledby="next-steps-heading"
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2
            id="next-steps-heading"
            className="text-center text-2xl md:text-3xl font-semibold text-white tracking-tight mb-10 md:mb-12"
            variants={fadeUpVariants}
          >
            What Happens{" "}
            <span className="text-gold-gradient">Next?</span>
          </motion.h2>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {NEXT_STEPS.map((step, index) => (
              <motion.article
                key={step.id}
                className="group relative rounded-3xl border border-white/[0.08] p-6 md:p-7 transition-transform duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(8, 12, 20, 0.55)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
                }}
                variants={fadeUpVariants}
                custom={index}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgb(var(--color-gold) / 0.06), transparent)",
                  }}
                />

                <span
                  className="relative mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium tracking-wider text-gold"
                  style={{
                    border: "1px solid rgb(var(--color-gold) / 0.3)",
                    backgroundColor: "rgb(var(--color-gold) / 0.08)",
                  }}
                >
                  0{step.id}
                </span>

                <h3 className="relative text-lg font-semibold text-white mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="relative text-sm text-white/65 font-light leading-relaxed">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Secondary CTAs */}
        <motion.section
          ref={ctaRef}
          className="mx-auto mt-16 md:mt-20 max-w-2xl text-center"
          aria-labelledby="before-meeting-heading"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
          animate={
            ctaInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: reducedMotion ? 0 : 24 }
          }
          transition={{
            duration: reducedMotion ? 0.01 : 0.65,
            ease: EASE,
          }}
        >
          <h2
            id="before-meeting-heading"
            className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-8"
          >
            Need Something Before Our Meeting?
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link href={ROUTES.HOME} className="btn-primary">
              Return to Homepage
            </Link>
            <Link href={ROUTES.SECTION_PORTFOLIO} className="btn-secondary">
              Visit Our Portfolio
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
