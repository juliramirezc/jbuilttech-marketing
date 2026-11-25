/**
 * Route-specific advertising/analytics isolation.
 * Glass Fabrication careers must not use shared GTM / Ads / Meta / GA4.
 */

export const TRACKING_ISOLATION_HEADER = "x-jbt-tracking-isolation";
export const TRACKING_ISOLATION_VALUE = "careers-glass-fabrication";

/** Paths that must never load or forward shared marketing tags. */
export const TRACKING_ISOLATED_PATHS = [
  "/careers/glass-fabrication",
] as const;

export const SHARED_TRACKING_IDS = {
  gtm: "GTM-MGZPGP8C",
  googleAdsPrimary: "AW-18330253504",
  googleAdsSecondary: "AW-18267099214",
  ga4: "G-J2QD5RNX1K",
  metaPixel: "2895032410830936",
} as const;

export function isTrackingIsolatedPath(pathname: string): boolean {
  const normalized = pathname.split("?")[0]?.replace(/\/$/, "") || "/";
  return (TRACKING_ISOLATED_PATHS as readonly string[]).includes(normalized);
}
