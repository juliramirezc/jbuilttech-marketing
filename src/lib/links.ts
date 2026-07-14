/**
 * Link Utilities
 * Helper functions for building URLs with tracking
 */

import { integrationsConfig } from "@/config";
import { getStoredUTMParams } from "./utm";

/** Primary Calendly booking page for all consultation CTAs */
export const CALENDLY_BOOKING_URL = "https://calendly.com/jbuilttech-info/30min";

/**
 * Get Calendly URL with UTM parameters
 */
export function getCalendlyUrl(): string | null {
  if (!integrationsConfig.calendly.enabled) return null;

  const baseUrl = integrationsConfig.calendly.url;
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
