/**
 * Consultation Booking
 *
 * Central entry point for consultation CTAs across the site.
 * Connects to Calendly when configured, otherwise dispatches a
 * custom event for future backend / widget integration.
 */

import { integrationsConfig } from "@/config";
import { trackCTAClick } from "./analytics";
import { getCalendlyUrl } from "./links";

export const CONSULTATION_REQUEST_EVENT = "jbuilttech:consultation-request";

export interface ConsultationRequestDetail {
  source: string;
}

/**
 * Open the consultation booking flow.
 *
 * Integration order:
 * 1. Calendly URL (when NEXT_PUBLIC_CALENDLY_URL is set)
 * 2. Custom event for app-level handlers (modal, API, etc.)
 */
export function openConsultationBooking(source = "consultation_cta"): void {
  trackCTAClick("consultation", source);

  const calendlyUrl = getCalendlyUrl();
  if (calendlyUrl && integrationsConfig.calendly.enabled) {
    const newWindow = window.open(calendlyUrl, "_blank");
    if (newWindow) newWindow.opener = null;
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ConsultationRequestDetail>(CONSULTATION_REQUEST_EVENT, {
      detail: { source },
    })
  );
}

/**
 * Subscribe to consultation requests (e.g. in a future booking modal).
 * Returns an unsubscribe function.
 */
export function onConsultationRequest(
  handler: (detail: ConsultationRequestDetail) => void
): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<ConsultationRequestDetail>).detail);
  };

  window.addEventListener(CONSULTATION_REQUEST_EVENT, listener);
  return () => window.removeEventListener(CONSULTATION_REQUEST_EVENT, listener);
}
