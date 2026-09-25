import { NextResponse } from "next/server";
import { requireNewsletterSession } from "@/lib/newsletterAuth";
import {
  createCampaignTag,
  submitBroadcastBulk,
  type BulkRecipient,
} from "@/lib/newsletterPostmark";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 20000;

function parseBody(body: unknown): {
  recipients: BulkRecipient[];
  confirmCount: number;
} | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as {
    recipients?: unknown;
    confirmCount?: unknown;
    confirmSend?: unknown;
  };
  if (obj.confirmSend !== true) return null;
  if (typeof obj.confirmCount !== "number" || !Number.isFinite(obj.confirmCount)) {
    return null;
  }
  if (!Array.isArray(obj.recipients) || obj.recipients.length === 0) return null;

  const recipients: BulkRecipient[] = [];
  for (const item of obj.recipients) {
    if (!item || typeof item !== "object") return null;
    const email = String((item as { email?: string }).email || "")
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(email) || email.includes(",")) return null;
    recipients.push({
      email,
      firstName: String((item as { firstName?: string }).firstName || "").trim(),
      lastName: String((item as { lastName?: string }).lastName || "").trim(),
    });
  }
  return { recipients, confirmCount: obj.confirmCount };
}

export async function POST(request: Request) {
  try {
    await requireNewsletterSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Full send requires confirmSend=true, confirmCount, and a recipients array",
      },
      { status: 400 }
    );
  }

  if (parsed.recipients.length !== parsed.confirmCount) {
    return NextResponse.json(
      {
        error: `confirmCount (${parsed.confirmCount}) does not match recipients length (${parsed.recipients.length})`,
      },
      { status: 400 }
    );
  }

  if (parsed.recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      {
        error: `Recipient list exceeds the ${MAX_RECIPIENTS} safety limit for a single request`,
      },
      { status: 400 }
    );
  }

  // Dedupe server-side as a safety net (client should already dedupe)
  const seen = new Set<string>();
  const unique: BulkRecipient[] = [];
  for (const r of parsed.recipients) {
    if (seen.has(r.email)) continue;
    seen.add(r.email);
    unique.push(r);
  }

  if (unique.length !== parsed.confirmCount) {
    return NextResponse.json(
      {
        error: `After server dedupe, unique count is ${unique.length} but confirmCount is ${parsed.confirmCount}. Re-upload and confirm again.`,
      },
      { status: 400 }
    );
  }

  const campaignTag = createCampaignTag("full");
  const result = await submitBroadcastBulk({
    recipients: unique,
    campaignTag,
    kind: "full",
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        errorCode: result.errorCode,
        bulkApiUnavailable: result.bulkApiUnavailable === true,
        details: result.details,
      },
      { status: result.bulkApiUnavailable ? 503 : 502 }
    );
  }

  return NextResponse.json({
    success: true,
    kind: "full",
    ...result,
    postmarkHint:
      "In Postmark → your Server → Message Streams → public-sector-newsletter → Activity (and Bulk requests), open this distribution by tag/bulk Id to review delivery, bounces, suppressions, and opens. Open tracking can miss reads when images are blocked — a missing open is not proof the email was unread. Unsubscribes are handled by Postmark Broadcast suppression.",
  });
}
