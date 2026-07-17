/**
 * Consultation Booking
 *
 * Central entry point for consultation CTAs across the site.
 * Opens the official Calendly popup; redirect to /thank-you happens
 * only after `calendly.event_scheduled` (see CalendlyProvider).
 */

import { trackCTAClick } from "./analytics";
import { openCalendlyPopup } from "./calendly";

export const CONSULTATION_REQUEST_EVENT = "jbuilttech:consultation-request";

export interface ConsultationRequestDetail {
  source: string;
}

/**
 * Open the consultation booking flow via Calendly popup.
 */
export function openConsultationBooking(source = "consultation_cta"): void {
  trackCTAClick("consultation", source);
  void openCalendlyPopup();
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
