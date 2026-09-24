import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/memberStories";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Proxy a file chunk to Google Drive's resumable upload URL.
 * Browser never talks to Google with credentials.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`upload-chunk:${ip}`, 240)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const uploadUrl = request.headers.get("x-upload-url");
  const contentRange = request.headers.get("content-range");
  const contentType =
    request.headers.get("content-type") || "application/octet-stream";

  if (!uploadUrl || !contentRange) {
    return NextResponse.json(
      { error: "X-Upload-Url and Content-Range are required" },
      { status: 400 }
    );
  }

  // Only allow Google Drive upload hosts
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(uploadUrl);
  } catch {
    return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
  }
  if (
    !parsedUrl.hostname.endsWith("googleapis.com") &&
    !parsedUrl.hostname.endsWith("google.com")
  ) {
    return NextResponse.json({ error: "Invalid upload host" }, { status: 400 });
  }

  const body = Buffer.from(await request.arrayBuffer());

  try {
    const upstream = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Range": contentRange,
        "Content-Length": String(body.length),
      },
      body,
    });

    // 308 Resume Incomplete — continue with next chunk
    if (upstream.status === 308) {
      const range = upstream.headers.get("range");
      return new NextResponse(null, {
        status: 308,
        headers: range ? { Range: range } : {},
      });
    }

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Chunk upload failed", detail: text.slice(0, 500) },
        { status: upstream.status }
      );
    }

    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { raw: text };
    }

    return NextResponse.json({
      ...data,
      id: data.id,
      driveFileId: data.id,
    });
  } catch (err) {
    console.error("[uploads/chunk]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chunk proxy failed" },
      { status: 502 }
    );
  }
}
