/**
 * Server-only Meta Conversions API helpers.
 * Do not import from Client Components.
 *
 * Never log access tokens, raw PII, or hashed PII.
 */

import { createHash } from "crypto";

export const META_LEAD_EVENT_NAME = "Lead" as const;

/** Browser-generated event_id shape (UUID preferred; allow safe fallbacks). */
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

const ALLOWED_THANK_YOU_HOSTS = new Set([
  "build.jbuilttech.com",
  "jbuilttech.com",
  "www.jbuilttech.com",
  "localhost",
  "127.0.0.1",
]);

export type MetaLeadClientPayload = {
  event_id: string;
  event_source_url: string;
  customer_email?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  fbp?: string;
  fbc?: string;
};

export type MetaUserData = {
  em?: string[];
  fn?: string[];
  ln?: string[];
  ph?: string[];
  fbp?: string;
  fbc?: string;
  client_user_agent?: string;
  client_ip_address?: string;
};

export type MetaLeadServerEvent = {
  event_name: typeof META_LEAD_EVENT_NAME;
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url: string;
  user_data: MetaUserData;
};

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Meta: trim + lowercase before hashing email. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Meta: lowercase, strip punctuation; UTF-8 preserved for special chars. */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Meta phone: digits only, include country code.
 * US 10-digit numbers get a leading 1. Leading zeros stripped.
 */
export function normalizePhone(phone: string): string | undefined {
  let digits = phone.replace(/\D/g, "");
  digits = digits.replace(/^0+/, "");
  if (!digits) return undefined;

  if (digits.length === 10) {
    digits = `1${digits}`;
  }

  if (digits.length < 11 || digits.length > 15) {
    return undefined;
  }

  return digits;
}

export function isValidEventId(eventId: unknown): eventId is string {
  return typeof eventId === "string" && EVENT_ID_PATTERN.test(eventId);
}

/**
 * Accept only legitimate thank-you URLs for this conversion (not an open proxy).
 */
export function isValidThankYouEventSourceUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length === 0 || url.length > 2048) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    if (parsed.username || parsed.password) return false;

    const host = parsed.hostname.toLowerCase();
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".localhost");
    const isAllowedHost =
      ALLOWED_THANK_YOU_HOSTS.has(host) ||
      host.endsWith(".jbuilttech.com") ||
      isLocal;

    if (!isAllowedHost) return false;
    if (isLocal && parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (!isLocal && parsed.protocol !== "https:") return false;

    return parsed.pathname === "/thank-you" || parsed.pathname === "/thank-you/";
  } catch {
    return false;
  }
}

/** Basic shape checks — do not invent identifiers. */
export function isValidFbp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  // fb.{subdomainIndex}.{creationTime}.{random}
  return /^fb\.\d+\.\d+\.\d+$/.test(trimmed) && trimmed.length <= 256;
}

export function isValidFbc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  // fb.{subdomainIndex}.{creationTime}.{fbclid}
  return /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length <= 512;
}

/**
 * First public-looking client IP from Vercel/proxy headers, or undefined.
 */
export function extractClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    for (const part of forwarded.split(",")) {
      const candidate = part.trim();
      if (isPlausibleIp(candidate)) return candidate;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isPlausibleIp(realIp)) return realIp;

  return undefined;
}

function isPlausibleIp(value: string): boolean {
  if (!value || value.length > 45) return false;
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const octets = value.split(".").map(Number);
    return octets.every((n) => n >= 0 && n <= 255);
  }
  // Loose IPv6 (enough to avoid inventing; reject garbage)
  if (value.includes(":") && /^[0-9a-fA-F:.]+$/.test(value)) {
    return true;
  }
  return false;
}

export function parseMetaLeadClientPayload(
  body: unknown
):
  | { ok: true; payload: MetaLeadClientPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const record = body as Record<string, unknown>;

  if (!isValidEventId(record.event_id)) {
    return { ok: false, error: "Invalid or missing event_id" };
  }

  if (!isValidThankYouEventSourceUrl(record.event_source_url)) {
    return { ok: false, error: "Invalid or missing event_source_url" };
  }

  // Reject attempts to choose arbitrary Meta event names / pixel IDs
  if ("event_name" in record || "pixel_id" in record || "access_token" in record) {
    return { ok: false, error: "Unsupported fields in request" };
  }

  const payload: MetaLeadClientPayload = {
    event_id: record.event_id,
    event_source_url: record.event_source_url.replace(/\/$/, ""),
  };

  const email = asNonEmptyString(record.customer_email);
  const firstName = asNonEmptyString(record.customer_first_name);
  const lastName = asNonEmptyString(record.customer_last_name);
  const phone = asNonEmptyString(record.customer_phone);

  if (email) payload.customer_email = email;
  if (firstName) payload.customer_first_name = firstName;
  if (lastName) payload.customer_last_name = lastName;
  if (phone) payload.customer_phone = phone;

  if (isValidFbp(record.fbp)) payload.fbp = record.fbp.trim();
  if (isValidFbc(record.fbc)) payload.fbc = record.fbc.trim();

  return { ok: true, payload };
}

/**
 * Build hashed user_data. Never log inputs or outputs.
 */
export function buildMetaUserData(
  payload: MetaLeadClientPayload,
  extras: {
    clientUserAgent?: string;
    clientIpAddress?: string;
  }
): MetaUserData {
  const userData: MetaUserData = {};

  if (payload.customer_email) {
    const normalized = normalizeEmail(payload.customer_email);
    if (normalized) userData.em = [sha256Hex(normalized)];
  }

  if (payload.customer_first_name) {
    const normalized = normalizeName(payload.customer_first_name);
    if (normalized) userData.fn = [sha256Hex(normalized)];
  }

  if (payload.customer_last_name) {
    const normalized = normalizeName(payload.customer_last_name);
    if (normalized) userData.ln = [sha256Hex(normalized)];
  }

  if (payload.customer_phone) {
    const normalized = normalizePhone(payload.customer_phone);
    if (normalized) userData.ph = [sha256Hex(normalized)];
  }

  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;

  const ua = asNonEmptyString(extras.clientUserAgent);
  if (ua) userData.client_user_agent = ua;

  if (extras.clientIpAddress && isPlausibleIp(extras.clientIpAddress)) {
    userData.client_ip_address = extras.clientIpAddress;
  }

  return userData;
}

export function buildMetaLeadServerEvent(
  payload: MetaLeadClientPayload,
  extras: {
    clientUserAgent?: string;
    clientIpAddress?: string;
  }
): MetaLeadServerEvent {
  return {
    event_name: META_LEAD_EVENT_NAME,
    event_time: Math.floor(Date.now() / 1000),
    event_id: payload.event_id,
    action_source: "website",
    event_source_url: payload.event_source_url,
    user_data: buildMetaUserData(payload, extras),
  };
}

export type MetaCapiSendResult =
  | { ok: true; eventsReceived?: number }
  | { ok: false; reason: string; upstreamStatus?: number };

/**
 * POST a single Lead event to Meta Graph API.
 * Token/pixel never returned. No PII logging.
 */
export async function sendMetaLeadEvent(options: {
  pixelId: string;
  accessToken: string;
  event: MetaLeadServerEvent;
  testEventCode?: string;
  signal?: AbortSignal;
}): Promise<MetaCapiSendResult> {
  const { pixelId, accessToken, event, testEventCode, signal } = options;

  const body: Record<string, unknown> = {
    data: [event],
    access_token: accessToken,
  };

  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch {
    return { ok: false, reason: "network_error" };
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: "meta_upstream_error",
      upstreamStatus: response.status,
    };
  }

  try {
    const json: unknown = await response.json();
    const eventsReceived =
      json &&
      typeof json === "object" &&
      typeof (json as { events_received?: unknown }).events_received === "number"
        ? (json as { events_received: number }).events_received
        : undefined;
    return { ok: true, eventsReceived };
  } catch {
    // 2xx with unreadable body — treat as success for best-effort
    return { ok: true };
  }
}
