/**
 * Analytics Utilities
 * Helper functions for tracking events
 */

import { analyticsConfig } from "@/config";

type EventParams = Record<string, string | number | boolean>;

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
