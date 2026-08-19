"use client";

import { LeadForm, useLeadModal } from "@/components/lead";

export function FinalLeadBlock() {
  const { markLeadSubmitted, setLeadFormFocused, hasSubmittedLead } =
    useLeadModal();

  return (
    <section
      className="relative bg-[#0a0a0a] py-14 md:py-16 lg:py-20 overflow-hidden"
      aria-labelledby="final-heading"
    >
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full blur-[100px]"
        style={{ backgroundColor: "rgb(var(--color-gold) / 0.06)" }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-center">
          <div className="lg:col-span-6">
            <h2
              id="final-heading"
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-white tracking-tight leading-[1.1] mb-4"
            >
              THE NEXT HOMEOWNER IS GOING TO HIRE SOMEBODY.
            </h2>
            <p className="text-xl sm:text-2xl font-semibold text-gold tracking-tight leading-snug max-w-xl">
              Make sure they can find you before they find the other guy.
            </p>
          </div>

          <div className="lg:col-span-6">
            {hasSubmittedLead ? (
              <div className="rounded-2xl border border-white/10 bg-[#101010]/95 p-6 text-center">
                <p className="text-xl font-semibold text-white mb-2">Got it.</p>
                <p className="text-white/70 text-sm">
                  We&apos;ll be in touch about getting your company found.
                </p>
              </div>
            ) : (
              <LeadForm
                source="final_form"
                idPrefix="final"
                trackView
                onFocusChange={setLeadFormFocused}
                onSubmitted={markLeadSubmitted}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
