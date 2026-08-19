"use client";

import { useEffect, useId, useState } from "react";
import { LeadForm } from "./LeadForm";
import type { LeadFormSource } from "./LeadProvider";

type LeadModalProps = {
  open: boolean;
  source: LeadFormSource;
  onClose: () => void;
  onSubmitted: () => void;
};

const INACTIVITY_MS = 5_000;

/**
 * Reusable lead modal. After ~5s of no field interaction, shows an inline
 * referrals nudge above the still-visible form (does not open a second modal).
 */
export function LeadModal({ open, source, onClose, onSubmitted }: LeadModalProps) {
  const titleId = useId();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showInactivityNudge, setShowInactivityNudge] = useState(false);

  useEffect(() => {
    if (!open) {
      setHasInteracted(false);
      setShowInactivityNudge(false);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || hasInteracted || showInactivityNudge) return;

    const timer = window.setTimeout(() => {
      setShowInactivityNudge(true);
    }, INACTIVITY_MS);

    return () => window.clearTimeout(timer);
  }, [open, hasInteracted, showInactivityNudge]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close form"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md max-h-[min(92vh,720px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-5 sm:p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        </button>

        <div className="sr-only" id={titleId}>
          Put Your Work Where Homeowners Are Looking
        </div>

        {showInactivityNudge ? (
          <div className="mb-5 pr-8 border-b border-white/10 pb-5">
            <p className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight">
              REFERRALS ARE GREAT.
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-gold tracking-tight leading-tight mb-3">
              UNTIL THEY SLOW DOWN.
            </p>
            <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed">
              You can walk out now.
            </p>
            <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed mt-2">
              But you could be leaving another opportunity for the other
              contractor to get found first.
            </p>
          </div>
        ) : null}

        <LeadForm
          source={source}
          variant="bare"
          idPrefix={`modal-${source}`}
          className="pr-2"
          onSubmitted={onSubmitted}
          onInteracted={() => setHasInteracted(true)}
        />
      </div>
    </div>
  );
}
