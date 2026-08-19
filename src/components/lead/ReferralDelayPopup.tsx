"use client";

import { useEffect, useId } from "react";
import { ConversionCta } from "./ConversionCta";

type ReferralDelayPopupProps = {
  open: boolean;
  onClose: () => void;
  onCta: () => void;
};

export function ReferralDelayPopup({
  open,
  onClose,
  onCta,
}: ReferralDelayPopupProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label="Close popup"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg max-h-[min(92vh,720px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#101010] p-5 sm:p-8 shadow-2xl"
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

        <h2
          id={titleId}
          className="pr-10 text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-5 leading-tight"
        >
          REFERRALS ARE GREAT UNTIL THEY SLOW DOWN.
        </h2>

        <div className="space-y-4 text-white/80 text-base sm:text-lg font-light leading-relaxed mb-8">
          <p>You can leave.</p>
          <p>But the next homeowner is still going to look for somebody.</p>
          <p className="text-white font-medium pt-1">
            Make sure they can find you.
          </p>
        </div>

        <ConversionCta onClick={onCta} className="w-full sm:w-auto">
          PUT MY WORK TO WORK
        </ConversionCta>
      </div>
    </div>
  );
}
