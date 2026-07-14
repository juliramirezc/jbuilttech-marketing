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
    projectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",
    enabled: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  },
} as const;

export type AnalyticsConfig = typeof analyticsConfig;
