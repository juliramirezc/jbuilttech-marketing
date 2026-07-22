/**
 * UTM Tracking Utilities
 * Capture and persist UTM parameters for attribution
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

const UTM_STORAGE_KEY = "jbuilttech_utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * Capture UTM parameters from URL and store them (first-touch only).
 * Never overwrites existing sessionStorage values for this session.
 */
export function captureUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const existing = getStoredUTMParams();
  if (existing) return existing;

  const searchParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  let hasUTM = false;
  for (const param of UTM_PARAMS) {
    const value = searchParams.get(param);
    if (value) {
      utmParams[param] = value;
      hasUTM = true;
    }
  }

  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    utmParams.referrer = document.referrer;
    hasUTM = true;
  }

  if (hasUTM) {
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
