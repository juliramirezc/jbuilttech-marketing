import { NextResponse } from "next/server";
import { requireNewsletterSession } from "@/lib/newsletterAuth";
import { getBulkRequestStatus } from "@/lib/newsletterPostmark";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireNewsletterSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing bulk request id" }, { status: 400 });
  }

  const result = await getBulkRequestStatus(id);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        errorCode: result.errorCode,
        bulkApiUnavailable: result.bulkApiUnavailable === true,
      },
      { status: result.bulkApiUnavailable ? 503 : 502 }
    );
  }

  return NextResponse.json(result);
}
