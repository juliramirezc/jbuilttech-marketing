"use client";

import { ConversionCta, useLeadModal } from "@/components/lead";
import { WorkVideoCarousel } from "./WorkVideoCarousel";

/**
 * Section 1 — approved copy + CTA (opens lead modal) + auto video carousel.
 * No inline form. No scroll runway.
 */
export function SalesHero() {
  const { openLeadModal } = useLeadModal();

  return (
    <section
      className="relative bg-[#090909] overflow-hidden pt-10 pb-12 md:pt-12 md:pb-14 lg:pt-14 lg:pb-16"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 180, 0.55) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 180, 0.55) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ backgroundColor: "rgb(var(--color-gold) / 0.07)" }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-center">
          <div className="lg:col-span-6 xl:col-span-6">
            <h1
              id="hero-heading"
              className="text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold text-white tracking-tight leading-[1.08] mb-6"
            >
              GOOD WORK DOESN&apos;T WIN JOBS IF NOBODY SEES IT.
            </h1>

            <div className="space-y-2.5 text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-xl mb-6">
              <p>You can be the better contractor.</p>
              <p>You can do cleaner work.</p>
              <p>You can answer the phone.</p>
              <p>You can take care of the homeowner.</p>
              <p className="text-white font-medium pt-1">
                And the other guy can still get the job.
              </p>
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-3">
              Why?
            </p>
            <p className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-gold tracking-tight leading-snug max-w-xl mb-8">
              Because the homeowner found him first.
            </p>

            <ConversionCta
              className="btn-conversion--pulse w-full sm:w-auto max-w-xl"
              onClick={() => openLeadModal("hero_primary")}
            >
              PUT YOUR WORK WHERE HOMEOWNERS ARE LOOKING
            </ConversionCta>
          </div>

          <div className="lg:col-span-6">
            <WorkVideoCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
