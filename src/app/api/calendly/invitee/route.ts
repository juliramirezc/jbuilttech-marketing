import {
  assertValidCalendlyInviteeUri,
  sanitizeInviteeResource,
} from "@/lib/calendlyInviteeApi";

export const runtime = "nodejs";

type ErrorBody = {
  error: string;
  /** Present in development only — never includes token or PII */
  upstream_status?: number;
  reason?: string;
  fetch_error_name?: string;
  fetch_error_message?: string;
  fetch_error_cause_code?: string;
  fetch_error_cause_errno?: string | number;
  fetch_error_cause_syscall?: string;
  fetch_error_cause_name?: string;
};

type DevExtras = {
  upstream_status?: number;
  reason?: string;
  fetch_error_name?: string;
  fetch_error_message?: string;
  fetch_error_cause_code?: string;
  fetch_error_cause_errno?: string | number;
  fetch_error_cause_syscall?: string;
  fetch_error_cause_name?: string;
};

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Strip anything that might contain URIs, tokens, or PII from an error message.
 * Keep short machine-oriented phrases (e.g. "fetch failed", "ENETUNREACH").
 */
function sanitizeErrorMessage(message: unknown): string | undefined {
  if (typeof message !== "string") return undefined;

  let msg = message.trim();
  if (!msg) return undefined;

  // Remove URLs, emails, bearer-looking strings
  msg = msg
    .replace(/https?:\/\/[^\s]+/gi, "[redacted_url]")
    .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[redacted_email]"
    )
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted_jwt]");

  // If still long or looks path-like, keep only the first clause
  if (msg.length > 160) {
    msg = `${msg.slice(0, 160)}…`;
  }

  return msg;
}

function readCauseField(
  cause: unknown,
  key: "code" | "errno" | "syscall" | "name"
): string | number | undefined {
  if (!cause || typeof cause !== "object") return undefined;
  const value = (cause as Record<string, unknown>)[key];
  if (typeof value === "string" || typeof value === "number") return value;
  return undefined;
}

/**
 * Development-only diagnostics for Node/Undici fetch failures.
 * Never includes token, Authorization, invitee URI, or customer PII.
 */
function getFetchFailureDiagnostics(err: unknown): DevExtras {
  const extras: DevExtras = { reason: "network_error" };

  if (!err || typeof err !== "object") {
    extras.fetch_error_name = typeof err;
    return extras;
  }

  const error = err as Error & { cause?: unknown };
  extras.fetch_error_name = error.name || "Error";
  extras.fetch_error_message = sanitizeErrorMessage(error.message);

  const cause = error.cause;
  if (cause && typeof cause === "object") {
    const causeName = readCauseField(cause, "name");
    const code = readCauseField(cause, "code");
    const errno = readCauseField(cause, "errno");
    const syscall = readCauseField(cause, "syscall");

    if (typeof causeName === "string") extras.fetch_error_cause_name = causeName;
    if (typeof code === "string") extras.fetch_error_cause_code = code;
    if (typeof errno === "string" || typeof errno === "number") {
      extras.fetch_error_cause_errno = errno;
    }
    if (typeof syscall === "string") extras.fetch_error_cause_syscall = syscall;

    // Nested cause (Undici sometimes wraps once more)
    const nested = (cause as { cause?: unknown }).cause;
    if (
      nested &&
      typeof nested === "object" &&
      extras.fetch_error_cause_code == null
    ) {
      const nestedCode = readCauseField(nested, "code");
      const nestedErrno = readCauseField(nested, "errno");
      const nestedSyscall = readCauseField(nested, "syscall");
      const nestedName = readCauseField(nested, "name");
      if (typeof nestedCode === "string") extras.fetch_error_cause_code = nestedCode;
      if (typeof nestedErrno === "string" || typeof nestedErrno === "number") {
        extras.fetch_error_cause_errno = nestedErrno;
      }
      if (typeof nestedSyscall === "string") {
        extras.fetch_error_cause_syscall = nestedSyscall;
      }
      if (typeof nestedName === "string") extras.fetch_error_cause_name = nestedName;
    }
  }

  return extras;
}

function jsonError(
  status: number,
  error: string,
  extras?: DevExtras
): Response {
  const body: ErrorBody = { error };
  if (isDev() && extras) {
    if (extras.upstream_status != null) body.upstream_status = extras.upstream_status;
    if (extras.reason) body.reason = extras.reason;
    if (extras.fetch_error_name) body.fetch_error_name = extras.fetch_error_name;
    if (extras.fetch_error_message) {
      body.fetch_error_message = extras.fetch_error_message;
    }
    if (extras.fetch_error_cause_code) {
      body.fetch_error_cause_code = extras.fetch_error_cause_code;
    }
    if (extras.fetch_error_cause_errno != null) {
      body.fetch_error_cause_errno = extras.fetch_error_cause_errno;
    }
    if (extras.fetch_error_cause_syscall) {
      body.fetch_error_cause_syscall = extras.fetch_error_cause_syscall;
    }
    if (extras.fetch_error_cause_name) {
      body.fetch_error_cause_name = extras.fetch_error_cause_name;
    }
  }
  return Response.json(body, { status });
}

/**
 * POST /api/calendly/invitee
 *
 * Body: { "invitee_uri": "https://api.calendly.com/scheduled_events/.../invitees/..." }
 *
 * Returns sanitized invitee fields only. Uses CALENDLY_API_TOKEN server-side.
 */
export async function POST(request: Request): Promise<Response> {
  // Trim — .env.local on Windows often includes trailing whitespace/CRLF
  const token = process.env.CALENDLY_API_TOKEN?.trim();
  if (!token) {
    return jsonError(503, "Calendly API is not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const inviteeUriRaw =
    body && typeof body === "object"
      ? (body as { invitee_uri?: unknown }).invitee_uri
      : undefined;

  const inviteeUri = assertValidCalendlyInviteeUri(inviteeUriRaw);
  if (!inviteeUri) {
    return jsonError(400, "Invalid or missing Calendly invitee URI");
  }

  let upstream: Response;
  try {
    upstream = await fetch(inviteeUri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (err) {
    return jsonError(
      502,
      "Failed to reach Calendly API",
      getFetchFailureDiagnostics(err)
    );
  }

  const upstreamStatus = upstream.status;

  if (upstreamStatus === 401 || upstreamStatus === 403) {
    return jsonError(502, "Calendly authentication failed", {
      upstream_status: upstreamStatus,
      reason:
        upstreamStatus === 401
          ? "calendly_unauthorized"
          : "calendly_forbidden",
    });
  }

  if (upstreamStatus === 404) {
    return jsonError(404, "Invitee not found", {
      upstream_status: 404,
      reason: "calendly_not_found",
    });
  }

  if (!upstream.ok) {
    return jsonError(502, "Calendly API request failed", {
      upstream_status: upstreamStatus,
      reason: "calendly_upstream_error",
    });
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return jsonError(502, "Malformed Calendly API response", {
      upstream_status: upstreamStatus,
      reason: "invalid_json",
    });
  }

  const resource =
    payload && typeof payload === "object"
      ? (payload as { resource?: unknown }).resource
      : undefined;

  const sanitized = sanitizeInviteeResource(resource);
  if (!sanitized) {
    return jsonError(502, "Malformed Calendly invitee data", {
      upstream_status: upstreamStatus,
      reason: "sanitize_failed_missing_email_or_resource",
    });
  }

  return Response.json(sanitized, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
