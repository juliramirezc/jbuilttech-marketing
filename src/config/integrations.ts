/**
 * Integrations Configuration
 * Third-party service URLs and settings
 */

/** Absolute thank-you URL used as Calendly post-booking redirect destination */
export const CALENDLY_REDIRECT_URL = "https://build.jbuilttech.com/thank-you";

/** Primary Calendly booking page for all consultation CTAs */
export const CALENDLY_BOOKING_URL = "https://calendly.com/jbuilttech-info/30min";

/**
 * Google Calendar Appointment Scheduling URL for /book-review.
 * Set NEXT_PUBLIC_GOOGLE_BOOKING_URL in Vercel / .env.local — do not invent a URL.
 */
export const GOOGLE_BOOKING_URL =
  process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim() || "";

export const integrationsConfig = {
  calendly: {
    /** Booking page — CTAs open this URL (scheduling UX unchanged) */
    url: process.env.NEXT_PUBLIC_CALENDLY_URL || CALENDLY_BOOKING_URL,
    enabled: true,
    /**
     * Absolute thank-you URL for Calendly dashboard Confirmation redirect
     * (optional backup on paid plans). In-app redirect is handled by
     * CalendlyProvider on `calendly.event_scheduled`.
     */
    redirectUrl: CALENDLY_REDIRECT_URL,
  },
  googleBooking: {
    /** Official Google Calendar appointment schedule / embed URL */
    url: GOOGLE_BOOKING_URL,
    enabled: GOOGLE_BOOKING_URL.length > 0,
  },
} as const;

export type IntegrationsConfig = typeof integrationsConfig;
