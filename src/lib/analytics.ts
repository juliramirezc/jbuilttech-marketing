/**
 * Analytics Utilities
 * Helper functions for tracking events (GTM dataLayer + optional gtag)
 */

import { analyticsConfig } from "@/config";

type EventParams = Record<string, string | number | boolean>;

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    __jbtConsultationBookedPushed?: boolean;
  }
}

/**
 * Push a custom event to the GTM dataLayer.
 */
export function pushDataLayerEvent(
  eventName: string,
  params?: EventParams
): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}

/**
 * Fire the consultation booking conversion event exactly once per page load.
 * Used on /thank-you as the primary conversion signal for GTM.
 */
export function pushConsultationBookedEvent(): void {
  if (typeof window === "undefined") return;

  // Exactly once per full page load (survives React Strict Mode remounts)
  if (window.__jbtConsultationBookedPushed) return;
  window.__jbtConsultationBookedPushed = true;

  pushDataLayerEvent("consultation_booked", {
    conversion_source: "calendly",
    page_path: "/thank-you",
  });
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(eventName: string, params?: EventParams) {
  if (!analyticsConfig.googleAnalytics.enabled) return;

  if (typeof window !== "undefined" && "gtag" in window) {
    (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      eventName,
      params
    );
  }
}

/**
 * Track a page view
 */
export function trackPageView(url: string) {
  if (!analyticsConfig.googleAnalytics.enabled) return;

  if (typeof window !== "undefined" && "gtag" in window) {
    (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag(
      "config",
      analyticsConfig.googleAnalytics.measurementId,
      {
        page_path: url,
      }
    );
  }
}

/**
 * Track CTA clicks
 */
export function trackCTAClick(ctaName: string, location: string) {
  trackEvent("cta_click", {
    cta_name: ctaName,
    location: location,
  });
}

/**
 * Track form submissions
 */
export function trackFormSubmit(formName: string) {
  trackEvent("form_submit", {
    form_name: formName,
  });
}
