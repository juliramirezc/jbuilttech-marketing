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

function parseRecipients(body: unknown): BulkRecipient[] | null {
  if (!body || typeof body !== "object") return null;
  const recipients = (body as { recipients?: unknown }).recipients;
  if (!Array.isArray(recipients) || recipients.length === 0) return null;
  const out: BulkRecipient[] = [];
  for (const item of recipients) {
    if (!item || typeof item !== "object") return null;
    const email = String((item as { email?: string }).email || "")
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(email) || email.includes(",")) return null;
    out.push({
      email,
      firstName: String((item as { firstName?: string }).firstName || "").trim(),
      lastName: String((item as { lastName?: string }).lastName || "").trim(),
    });
  }
  return out;
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

  const recipients = parseRecipients(body);
  if (!recipients || recipients.length !== 1) {
    return NextResponse.json(
      { error: "Send test requires exactly one recipient object" },
      { status: 400 }
    );
  }

  const campaignTag = createCampaignTag("test");
  const result = await submitBroadcastBulk({
    recipients,
    campaignTag,
    kind: "test",
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
    kind: "test",
    ...result,
    postmarkHint:
      "In Postmark → your Server → Message Streams → public-sector-newsletter → Activity / Bulk, open this bulk request to review acceptance, bounces, and opens. Open tracking can miss reads when images are blocked — do not treat a missing open as proof the email was unread.",
  });
}
