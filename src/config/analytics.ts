/**
 * Analytics Configuration
 * Google Analytics and Microsoft Clarity settings
 */

export const analyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  clarity: {
    /** Matches Glazier GTM Clarity tag (xnhh6lzw5q) when env is unset. */
    projectId:
      process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "xnhh6lzw5q",
    enabled: true,
  },
} as const;

export type AnalyticsConfig = typeof analyticsConfig;
