import { NextResponse } from "next/server";
import { assertGoogleDriveConfigured, getMissingGoogleEnvNames } from "@/lib/googleDrive";
import {
  geofenceApplicationSchema,
  resolveGeofenceFormConfig,
  resolveLeadSource,
} from "@/lib/geofenceForms";
import {
  appendGeofenceApplicationRow,
  ensureGeofenceConstructionSheet,
} from "@/lib/geofenceSheets";
import { clientIp, rateLimit } from "@/lib/memberStories";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Short-lived in-memory dedupe (submissionId is not stored in the sheet). */
const recentSubmissionIds = new Map<string, number>();
const DEDUPE_TTL_MS = 10 * 60 * 1000;

function isRecentDuplicate(submissionId: string): boolean {
  const now = Date.now();
  for (const [id, at] of recentSubmissionIds) {
    if (now - at > DEDUPE_TTL_MS) recentSubmissionIds.delete(id);
  }
  if (recentSubmissionIds.has(submissionId)) return true;
  recentSubmissionIds.set(submissionId, now);
  return false;
}

function isConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("not configured") || msg.includes("missing:");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`geofence-construction:${ip}`, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = geofenceApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid phone number" },
      { status: 400 }
    );
  }

  let config;
  try {
    config = resolveGeofenceFormConfig(data.formKey);
  } catch {
    return NextResponse.json(
      { error: "This application form is not available" },
      { status: 400 }
    );
  }

  // Server-side force — never trust client destination fields
  const sheetTab = config.sheetTab;
  const leadSource = resolveLeadSource(data.utmMedium);

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const email = data.email.trim().toLowerCase();
  const phone = data.phone.trim();
  const hasTradeExperience = data.hasTradeExperience;
  const experienceLength =
    hasTradeExperience === "Yes" ? data.experienceLength.trim() : "";
  const callAvailability = data.callAvailability.trim();

  if (isRecentDuplicate(data.submissionId)) {
    return NextResponse.json({
      success: true,
      submissionId: data.submissionId,
      duplicate: true,
    });
  }

  try {
    assertGoogleDriveConfigured();
    const { spreadsheetId } = await ensureGeofenceConstructionSheet(config);

    await appendGeofenceApplicationRow({
      spreadsheetId,
      sheetTab,
      firstName,
      lastName,
      email,
      phone,
      hasTradeExperience,
      experienceLength,
      callAvailability,
      leadSource,
    });

    return NextResponse.json({
      success: true,
      submissionId: data.submissionId,
    });
  } catch (err) {
    // Allow a retry if Sheets append failed
    recentSubmissionIds.delete(data.submissionId);
    console.error("[geofence-construction]", err);
    const configMissing = isConfigError(err);
    return NextResponse.json(
      {
        error: configMissing
          ? `Application storage is not configured (missing: ${getMissingGoogleEnvNames().join(", ") || "Google credentials"}).`
          : "We could not save your application right now. Please try again in a few minutes.",
        code: configMissing ? "google_config_missing" : "geofence_save_failed",
        missingEnv: configMissing ? getMissingGoogleEnvNames() : undefined,
      },
      { status: configMissing ? 503 : 502 }
    );
  }
}
