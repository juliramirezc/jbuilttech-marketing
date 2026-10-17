import { NextResponse } from "next/server";
import {
  assertGoogleDriveConfigured,
  getMissingGoogleEnvNames,
} from "@/lib/googleDrive";
import { LEON_CLASS } from "@/lib/buildingUnionPower/classes";
import {
  formatNyTimestamp,
  marionRegistrationSchema,
} from "@/lib/buildingUnionPower/schema";
import { saveRegistrationToMasterAndSync } from "@/lib/buildingUnionPower/sync";
import { clientIp, rateLimit } from "@/lib/memberStories";

export const runtime = "nodejs";
export const maxDuration = 60;

const recentFingerprints = new Map<string, number>();
const DEDUPE_TTL_MS = 2 * 60 * 1000;

function isRecentDuplicate(fingerprint: string): boolean {
  const now = Date.now();
  for (const [key, at] of recentFingerprints) {
    if (now - at > DEDUPE_TTL_MS) recentFingerprints.delete(key);
  }
  if (recentFingerprints.has(fingerprint)) return true;
  recentFingerprints.set(fingerprint, now);
  return false;
}

function isConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("not configured") || msg.includes("missing:");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`bup-leon:${ip}`, 20)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = marionRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = {
    ...parsed.data,
    fullName: parsed.data.fullName.trim(),
    cellphone: parsed.data.cellphone.trim(),
    email: (parsed.data.email || "").trim().toLowerCase(),
    employer: parsed.data.employer.trim(),
    workLocation: parsed.data.workLocation.trim(),
    jobTitle: parsed.data.jobTitle.trim(),
    learnGoals: (parsed.data.learnGoals || "").trim(),
    accommodations: (parsed.data.accommodations || "").trim(),
  };

  const fingerprint = [
    data.fullName.toLowerCase(),
    data.cellphone.replace(/\D/g, ""),
    data.email,
  ].join("|");

  if (isRecentDuplicate(fingerprint)) {
    return NextResponse.json({
      success: true,
      duplicate: true,
    });
  }

  const submittedAt = formatNyTimestamp();
  const registrationId =
    typeof (body as { registrationId?: unknown })?.registrationId === "string"
      ? (body as { registrationId: string }).registrationId.trim()
      : undefined;

  try {
    assertGoogleDriveConfigured();
    const result = await saveRegistrationToMasterAndSync({
      config: LEON_CLASS,
      data,
      submittedAt,
      registrationId: registrationId || undefined,
    });

    console.info(
      "[building-union-power/leon] registration saved",
      JSON.stringify({
        sharedSynced: result.sharedSynced,
        duplicate: Boolean(result.duplicate),
      })
    );

    return NextResponse.json({
      success: true,
      registrationId: result.registrationId,
      sharedSynced: result.sharedSynced,
    });
  } catch (err) {
    recentFingerprints.delete(fingerprint);
    console.error("[building-union-power/leon]", err);
    const configMissing = isConfigError(err);
    return NextResponse.json(
      {
        error: configMissing
          ? `Registration storage is not configured (missing: ${getMissingGoogleEnvNames().join(", ") || "Google credentials"}).`
          : "We could not save your registration right now. Please try again in a few minutes.",
        code: configMissing ? "google_config_missing" : "registration_save_failed",
        missingEnv: configMissing ? getMissingGoogleEnvNames() : undefined,
      },
      { status: configMissing ? 503 : 502 }
    );
  }
}
