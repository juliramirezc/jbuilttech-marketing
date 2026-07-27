/**
 * Analytics Utilities
 * Helper functions for tracking events (GTM dataLayer + optional gtag)
 */

import { analyticsConfig } from "@/config";
import { getStoredUTMParams, type UTMParams } from "./utm";

type EventParams = Record<string, string | number | boolean>;

type DataLayerEvent = Record<string, unknown> & { event: string };

/** Customer fields for Ads Enhanced Conversions / Meta Advanced Matching via GTM.
 *  Keep on the dataLayer only — do not map these as GA4 event parameters in GTM.
 */
export type ConsultationCustomerParams = {
  customer_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    __jbtConsultationBookedPushed?: boolean;
    __jbtConsultationBookedStarted?: boolean;
  }
}

/** Must match CalendlyProvider sessionStorage key (URI only — no PII). */
const CALENDLY_INVITEE_URI_KEY = "jbuilttech_calendly_invitee_uri";

/** Persist Meta event_id for the current booking (dedupe Pixel + CAPI). */
const META_EVENT_ID_KEY = "jbuilttech_meta_event_id";
const META_EVENT_ID_BOOKING_KEY = "jbuilttech_meta_event_id_booking";
/** event_id for which a CAPI attempt was already started/sent */
const META_CAPI_SENT_KEY = "jbuilttech_meta_capi_sent";

/** Max wait for invitee enrichment before firing consultation_booked without PII */
const ENRICHMENT_TIMEOUT_MS = 4000;

/** Best-effort CAPI client timeout — must not block measurement */
const META_CAPI_TIMEOUT_MS = 4000;

/** Attribution keys included on consultation_booked when present in sessionStorage */
const ATTRIBUTION_EVENT_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "landing_page",
  "referrer",
  "first_visit_timestamp",
] as const satisfies ReadonlyArray<keyof UTMParams>;

/** Shared in-flight promise — survives Strict Mode remounts in the same page load */
let consultationBookedInFlight: Promise<void> | null = null;

/** Shared CAPI in-flight guard (same page load) */
let metaCapiInFlight: Promise<void> | null = null;

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
 * Build attribution payload from sessionStorage — only include present values.
 */
function getAttributionEventParams(): EventParams {
  const stored = getStoredUTMParams();
  if (!stored) return {};

  const params: EventParams = {};
  for (const key of ATTRIBUTION_EVENT_KEYS) {
    const value = stored[key];
    if (typeof value === "string" && value.length > 0) {
      params[key] = value;
    }
  }
  return params;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Build optional customer_* params for dataLayer (never logged).
 * Phone is optional — omit when absent. Never hashed here.
 */
function toCustomerEventParams(
  customer?: ConsultationCustomerParams
): EventParams {
  if (!customer) return {};

  const params: EventParams = {};
  if (customer.customer_email) params.customer_email = customer.customer_email;
  if (customer.customer_first_name) {
    params.customer_first_name = customer.customer_first_name;
  }
  if (customer.customer_last_name) {
    params.customer_last_name = customer.customer_last_name;
  }
  if (customer.customer_phone) {
    params.customer_phone = customer.customer_phone;
  }
  return params;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) {
      const value = rest.join("=");
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

function createEventId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `cb_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getBookingKey(): string {
  try {
    const inviteeUri = sessionStorage.getItem(CALENDLY_INVITEE_URI_KEY);
    if (inviteeUri && inviteeUri.trim().length > 0) {
      return inviteeUri.trim();
    }
  } catch {
    // ignore
  }
  return "anonymous";
}

/**
 * One event_id per completed booking. Reused on thank-you reloads.
 */
function getOrCreateMetaEventId(): string {
  const bookingKey = getBookingKey();

  try {
    const existingId = sessionStorage.getItem(META_EVENT_ID_KEY);
    const existingBooking = sessionStorage.getItem(META_EVENT_ID_BOOKING_KEY);
    if (
      existingId &&
      existingId.length >= 8 &&
      existingBooking === bookingKey
    ) {
      return existingId;
    }

    const nextId = createEventId();
    sessionStorage.setItem(META_EVENT_ID_KEY, nextId);
    sessionStorage.setItem(META_EVENT_ID_BOOKING_KEY, bookingKey);
    return nextId;
  } catch {
    return createEventId();
  }
}

function wasMetaCapiAttempted(eventId: string): boolean {
  try {
    return sessionStorage.getItem(META_CAPI_SENT_KEY) === eventId;
  } catch {
    return false;
  }
}

function markMetaCapiAttempted(eventId: string): void {
  try {
    sessionStorage.setItem(META_CAPI_SENT_KEY, eventId);
  } catch {
    // ignore
  }
}

/**
 * Read _fbp / _fbc. If _fbc missing, construct from stored fbclid using
 * Meta's documented format: fb.1.{creationTimeMs}.{fbclid}
 */
function getMetaClickIds(): { fbp?: string; fbc?: string } {
  const result: { fbp?: string; fbc?: string } = {};

  const fbp = getCookie("_fbp");
  if (fbp && /^fb\.\d+\.\d+\.\d+$/.test(fbp)) {
    result.fbp = fbp;
  }

  const fbcCookie = getCookie("_fbc");
  if (fbcCookie && /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(fbcCookie)) {
    result.fbc = fbcCookie;
    return result;
  }

  const stored = getStoredUTMParams();
  const fbclid = asNonEmptyString(stored?.fbclid);
  if (!fbclid || !/^[A-Za-z0-9_-]+$/.test(fbclid)) {
    return result;
  }

  let creationTimeMs = Date.now();
  const firstVisit = asNonEmptyString(stored?.first_visit_timestamp);
  if (firstVisit) {
    const parsed = Date.parse(firstVisit);
    if (!Number.isNaN(parsed) && parsed > 0) {
      creationTimeMs = parsed;
    }
  }

  result.fbc = `fb.1.${creationTimeMs}.${fbclid}`;
  return result;
}

/**
 * Call /api/calendly/invitee using the stored invitee URI.
 * Returns {} on any failure/timeout/invalid payload — never throws, never logs PII.
 */
async function fetchInviteeCustomerParams(): Promise<ConsultationCustomerParams> {
  let inviteeUri: string | null = null;
  try {
    inviteeUri = sessionStorage.getItem(CALENDLY_INVITEE_URI_KEY);
  } catch {
    return {};
  }

  if (!inviteeUri || inviteeUri.trim().length === 0) {
    return {};
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    ENRICHMENT_TIMEOUT_MS
  );

  try {
    const response = await fetch("/api/calendly/invitee", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invitee_uri: inviteeUri }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return {};

    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return {};

    const record = data as Record<string, unknown>;
    const email = asNonEmptyString(record.email);
    if (!email) return {};

    const customer: ConsultationCustomerParams = {
      customer_email: email,
    };

    const firstName = asNonEmptyString(record.first_name);
    const lastName = asNonEmptyString(record.last_name);
    const phone = asNonEmptyString(record.phone);

    if (firstName) customer.customer_first_name = firstName;
    if (lastName) customer.customer_last_name = lastName;
    if (phone) customer.customer_phone = phone;

    return customer;
  } catch {
    return {};
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Best-effort Meta CAPI Lead. Never throws. Never blocks measurement.
 * Does not log PII.
 */
function sendMetaLeadCapiBestEffort(
  eventId: string,
  customer: ConsultationCustomerParams
): void {
  if (typeof window === "undefined") return;
  if (wasMetaCapiAttempted(eventId)) return;
  if (metaCapiInFlight) return;

  markMetaCapiAttempted(eventId);

  const { fbp, fbc } = getMetaClickIds();
  const eventSourceUrl = `${window.location.origin}/thank-you`;

  const body: Record<string, string> = {
    event_id: eventId,
    event_source_url: eventSourceUrl,
  };

  if (customer.customer_email) body.customer_email = customer.customer_email;
  if (customer.customer_first_name) {
    body.customer_first_name = customer.customer_first_name;
  }
  if (customer.customer_last_name) {
    body.customer_last_name = customer.customer_last_name;
  }
  if (customer.customer_phone) body.customer_phone = customer.customer_phone;
  if (fbp) body.fbp = fbp;
  if (fbc) body.fbc = fbc;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    META_CAPI_TIMEOUT_MS
  );

  metaCapiInFlight = (async () => {
    try {
      await fetch("/api/meta/events", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
        keepalive: true,
      });
    } catch {
      // Best-effort — measurement already fired
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();
}

/**
 * Fire the consultation booking conversion event exactly once per page load.
 * Used on /thank-you as the primary conversion signal for GTM.
 *
 * `customer_*` fields (when provided) stay on the dataLayer for Google Ads
 * Enhanced Conversions and Meta Advanced Matching. Do not map them as GA4
 * event parameters in GTM.
 */
export function pushConsultationBookedEvent(
  customer?: ConsultationCustomerParams,
  eventId?: string
): void {
  if (typeof window === "undefined") return;

  // Exactly once per full page load (survives React Strict Mode remounts)
  if (window.__jbtConsultationBookedPushed) return;
  window.__jbtConsultationBookedPushed = true;

  // Always emit a non-empty event_id (even if caller omits the arg)
  const resolvedEventId =
    typeof eventId === "string" && eventId.trim().length > 0
      ? eventId.trim()
      : getOrCreateMetaEventId();

  pushDataLayerEvent("consultation_booked", {
    conversion_source: "calendly",
    page_path: "/thank-you",
    ...getAttributionEventParams(),
    ...toCustomerEventParams(customer),
    // Set last so attribution/customer spreads can never overwrite it
    event_id: resolvedEventId,
  });
}

/**
 * Wait for Calendly invitee enrichment (with timeout), then fire
 * consultation_booked exactly once. Always fires — enrichment / CAPI
 * failure must not block measurement.
 */
export function fireConsultationBookedOnce(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.__jbtConsultationBookedPushed) return Promise.resolve();

  // Shared promise survives Strict Mode remounts / duplicate effect runs
  if (consultationBookedInFlight) return consultationBookedInFlight;

  window.__jbtConsultationBookedStarted = true;

  consultationBookedInFlight = (async () => {
    const customer = await fetchInviteeCustomerParams();
    const eventId = getOrCreateMetaEventId();

    // Measurement first — never blocked by Meta CAPI
    pushConsultationBookedEvent(customer, eventId);

    // Best-effort server Lead with the same event_id
    sendMetaLeadCapiBestEffort(eventId, customer);
  })();

  return consultationBookedInFlight;
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
