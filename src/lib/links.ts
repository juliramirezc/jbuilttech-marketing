/**
 * Link Utilities
 * Helper functions for building URLs with tracking
 */

import {
  integrationsConfig,
  CALENDLY_BOOKING_URL,
  CALENDLY_REDIRECT_URL,
} from "@/config/integrations";
import { getStoredUTMParams } from "./utm";

export { CALENDLY_BOOKING_URL, CALENDLY_REDIRECT_URL };

/**
 * Get Calendly URL with UTM parameters.
 *
 * Booking opens via the official Calendly popup widget (CalendlyProvider).
 * After a successful booking, `calendly.event_scheduled` redirects to /thank-you.
 *
 * Optional dashboard backup (paid plans):
 * Event Type → Confirmation page → Redirect to CALENDLY_REDIRECT_URL
 */
export function getCalendlyUrl(): string | null {
  if (!integrationsConfig.calendly.enabled) return null;

  const baseUrl = integrationsConfig.calendly.url || CALENDLY_BOOKING_URL;
  const utmParams = getStoredUTMParams();

  if (!utmParams) return baseUrl;

  const url = new URL(baseUrl);

  if (utmParams.utm_source) url.searchParams.set("utm_source", utmParams.utm_source);
  if (utmParams.utm_medium) url.searchParams.set("utm_medium", utmParams.utm_medium);
  if (utmParams.utm_campaign) url.searchParams.set("utm_campaign", utmParams.utm_campaign);

  return url.toString();
}

/**
 * Build external link with rel attributes
 */
export function getExternalLinkProps() {
  return {
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;
}
