/**
 * Server-only Calendly Invitee API helpers.
 * Do not import from Client Components.
 */

/** Expected Calendly invitee resource URI shape (no trailing slash required) */
const CALENDLY_INVITEE_URI_PATTERN =
  /^https:\/\/api\.calendly\.com\/scheduled_events\/[A-Za-z0-9_-]+\/invitees\/[A-Za-z0-9_-]+$/;

export type CalendlyInviteeSanitized = {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export function isValidCalendlyInviteeUri(uri: unknown): uri is string {
  if (typeof uri !== "string" || uri.length === 0 || uri.length > 512) {
    return false;
  }

  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname !== "api.calendly.com") return false;
    if (parsed.username || parsed.password) return false;
    if (parsed.search || parsed.hash) return false;
  } catch {
    return false;
  }

  return CALENDLY_INVITEE_URI_PATTERN.test(uri.replace(/\/$/, ""));
}

export function assertValidCalendlyInviteeUri(uri: unknown): string | null {
  if (!isValidCalendlyInviteeUri(uri)) return null;
  return uri.replace(/\/$/, "");
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function extractPhoneFromQuestions(questions: unknown): string | undefined {
  if (!Array.isArray(questions)) return undefined;

  for (const item of questions) {
    if (!item || typeof item !== "object") continue;
    const question = asNonEmptyString((item as { question?: unknown }).question);
    const answer = asNonEmptyString((item as { answer?: unknown }).answer);
    if (!question || !answer) continue;

    if (/phone|mobile|cell|sms/i.test(question)) {
      return answer;
    }
  }

  return undefined;
}

/**
 * Map Calendly invitee resource → sanitized client response (no full payload).
 */
export function sanitizeInviteeResource(
  resource: unknown
): CalendlyInviteeSanitized | null {
  if (!resource || typeof resource !== "object") return null;

  const data = resource as Record<string, unknown>;
  const email = asNonEmptyString(data.email);
  if (!email) return null;

  let firstName = asNonEmptyString(data.first_name);
  let lastName = asNonEmptyString(data.last_name);

  // Event types with a single name field leave first/last null
  if (!firstName && !lastName) {
    const fullName = asNonEmptyString(data.name);
    if (fullName) {
      const parts = fullName.split(/\s+/);
      firstName = parts[0];
      if (parts.length > 1) {
        lastName = parts.slice(1).join(" ");
      }
    }
  }

  const phone =
    asNonEmptyString(data.text_reminder_number) ??
    extractPhoneFromQuestions(data.questions_and_answers);

  const result: CalendlyInviteeSanitized = { email };
  if (firstName) result.first_name = firstName;
  if (lastName) result.last_name = lastName;
  if (phone) result.phone = phone;

  return result;
}
