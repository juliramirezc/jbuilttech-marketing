/**
 * UTM Tracking Utilities
 * Capture and persist attribution parameters for first-touch attribution
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
  first_visit_timestamp?: string;
}

const UTM_STORAGE_KEY = "jbuilttech_utm";

/** Query params captured into sessionStorage (first-touch) */
const ATTRIBUTION_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

/**
 * Capture attribution parameters from URL and store them (first-touch only).
 * Never overwrites existing sessionStorage values for this session.
 */
export function captureUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const existing = getStoredUTMParams();
  if (existing) return existing;

  const searchParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  let hasAttribution = false;
  for (const param of ATTRIBUTION_QUERY_KEYS) {
    const value = searchParams.get(param);
    if (value) {
      utmParams[param] = value;
      hasAttribution = true;
    }
  }

  // First-touch landing page (path + search as visited)
  const landingPage = `${window.location.pathname}${window.location.search}`;
  if (landingPage) {
    utmParams.landing_page = landingPage;
    hasAttribution = true;
  }

  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    utmParams.referrer = document.referrer;
    hasAttribution = true;
  }

  if (hasAttribution) {
    utmParams.first_visit_timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    } catch {
      // Storage unavailable
    }
    return utmParams;
  }

  return null;
}

/**
 * Get stored UTM parameters
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear stored UTM parameters
 */
export function clearUTMParams(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}
