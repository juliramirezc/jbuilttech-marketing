/**
 * Google Calendar Appointment Scheduling helpers.
 * Validates public booking URLs only — never private calendar feeds.
 */

const GOOGLE_APPOINTMENT_HOST = "calendar.google.com";
const GOOGLE_APPOINTMENT_PATH_PREFIX = "/calendar/appointments/";

export type GoogleBookingUrlResult =
  | { ok: true; bookingUrl: string; embedUrl: string }
  | { ok: false; reason: "missing" | "invalid" };

function normalizeCandidate(raw: string | undefined | null): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Accept only official Google Calendar appointment scheduling URLs.
 * Rejects private calendar embeds, arbitrary hosts, and javascript: URLs.
 */
export function parseGoogleBookingUrl(
  raw: string | undefined | null
): GoogleBookingUrlResult {
  const candidate = normalizeCandidate(raw);
  if (!candidate) return { ok: false, reason: "missing" };

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (url.protocol !== "https:") return { ok: false, reason: "invalid" };
  if (url.hostname !== GOOGLE_APPOINTMENT_HOST) {
    return { ok: false, reason: "invalid" };
  }
  if (!url.pathname.startsWith(GOOGLE_APPOINTMENT_PATH_PREFIX)) {
    return { ok: false, reason: "invalid" };
  }

  // Strip fragments; keep schedule path + safe query params
  url.hash = "";

  const bookingUrl = url.toString();
  const embed = new URL(bookingUrl);
  if (!embed.searchParams.has("gv")) {
    embed.searchParams.set("gv", "true");
  }
  const embedUrl = embed.toString();

  return { ok: true, bookingUrl, embedUrl };
}

export function getConfiguredGoogleBookingUrl(): string | null {
  return normalizeCandidate(process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL);
}

export function resolveGoogleBookingConfig(
  overrideUrl?: string | null
): GoogleBookingUrlResult {
  return parseGoogleBookingUrl(
    overrideUrl ?? getConfiguredGoogleBookingUrl()
  );
}
