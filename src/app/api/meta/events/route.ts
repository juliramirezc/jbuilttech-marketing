import {
  buildMetaLeadServerEvent,
  extractClientIp,
  parseMetaLeadClientPayload,
  sendMetaLeadEvent,
} from "@/lib/metaCapi";

export const runtime = "nodejs";

type ErrorBody = {
  error: string;
  reason?: string;
};

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function jsonError(
  status: number,
  error: string,
  reason?: string
): Response {
  const body: ErrorBody = { error };
  if (isDev() && reason) body.reason = reason;
  return Response.json(body, { status });
}

/**
 * POST /api/meta/events
 *
 * Fixed Lead conversion for consultation bookings.
 * Browser cannot choose event_name or pixel_id.
 *
 * Body: {
 *   event_id, event_source_url,
 *   customer_email?, customer_first_name?, customer_last_name?, customer_phone?,
 *   fbp?, fbc?
 * }
 */
export async function POST(request: Request): Promise<Response> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const pixelId = process.env.META_PIXEL_ID?.trim();

  if (!accessToken || !pixelId) {
    return jsonError(503, "Meta Conversions API is not configured", "missing_env");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = parseMetaLeadClientPayload(body);
  if (!parsed.ok) {
    return jsonError(400, parsed.error);
  }

  const serverEvent = buildMetaLeadServerEvent(parsed.payload, {
    clientUserAgent: request.headers.get("user-agent") ?? undefined,
    clientIpAddress: extractClientIp(request),
  });

  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim() || undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const result = await sendMetaLeadEvent({
      pixelId,
      accessToken,
      event: serverEvent,
      testEventCode,
      signal: controller.signal,
    });

    if (!result.ok) {
      return jsonError(502, "Failed to send Meta event", result.reason);
    }

    return Response.json(
      { ok: true },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
