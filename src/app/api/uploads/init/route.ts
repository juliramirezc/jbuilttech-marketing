import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  assertGoogleDriveConfigured,
  getMissingGoogleEnvNames,
  resolveAllowlistedUploadParent,
  startResumableUpload,
  sanitizeFileName,
} from "@/lib/googleDrive";
import {
  clientIp,
  isAllowedMedia,
  normalizeMimeType,
  rateLimit,
  uploadInitSchema,
} from "@/lib/memberStories";

export const runtime = "nodejs";
export const maxDuration = 60;

function isConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("not configured") ||
    msg.includes("missing:") ||
    getMissingGoogleEnvNames().length > 0
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`upload-init:${ip}`, 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = uploadInitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (!isAllowedMedia(data.fileName, data.mimeType)) {
    return NextResponse.json(
      { error: "File type is not allowed" },
      { status: 400 }
    );
  }

  try {
    assertGoogleDriveConfigured();

    const parentFolderId = await resolveAllowlistedUploadParent({
      folderName: data.folderName,
      formType: data.formType,
      submissionId: data.submissionId,
    });

    const mimeType = normalizeMimeType(data.fileName, data.mimeType);
    const { uploadUrl } = await startResumableUpload({
      parentFolderId,
      fileName: sanitizeFileName(data.fileName),
      mimeType,
      fileSize: data.fileSize,
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      uploadId: randomUUID(),
      submissionId: data.submissionId,
    });
  } catch (err) {
    console.error("[uploads/init]", err);
    const message =
      err instanceof Error ? err.message : "Could not start upload session";
    const status = isConfigError(err) ? 503 : 502;
    return NextResponse.json(
      {
        error: message,
        code: isConfigError(err) ? "google_config_missing" : "upload_init_failed",
        missingEnv: isConfigError(err) ? getMissingGoogleEnvNames() : undefined,
      },
      { status }
    );
  }
}
