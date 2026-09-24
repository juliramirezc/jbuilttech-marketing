import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/memberStories";

export const runtime = "nodejs";

const completeSchema = z.object({
  uploadId: z.string().min(1).max(80),
  name: z.string().max(240).optional(),
  email: z.string().email().max(254),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().nonnegative().optional(),
  mimeType: z.string().max(120).optional(),
  driveFileId: z.string().min(1).max(200),
  folderName: z.string().max(120).optional(),
  formType: z.string().max(80).optional(),
  submissionId: z.string().min(8).max(80).optional(),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  story: z.string().max(20000).optional(),
});

/**
 * Finalize a single media file. Does NOT send the member-story notification email.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`upload-complete:${ip}`, 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid complete payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Per-file finalize only — notification happens in POST /api/member-stories
  return NextResponse.json({
    success: true,
    uploadId: parsed.data.uploadId,
    driveFileId: parsed.data.driveFileId,
    fileName: parsed.data.fileName,
    submissionId: parsed.data.submissionId,
  });
}
