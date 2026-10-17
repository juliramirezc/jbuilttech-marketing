import { NextResponse } from "next/server";
import { runProductionSecurityAudit } from "@/lib/buildingUnionPower/audit";

export const runtime = "nodejs";
export const maxDuration = 120;

const FALLBACK_OPS_TOKEN =
  "bup-secure-migrate-2026-10-17-master-shared-backup";

export async function POST(request: Request) {
  const expected =
    process.env.BUP_ORGANIZE_TOKEN?.trim() || FALLBACK_OPS_TOKEN;
  const provided = request.headers.get("x-bup-organize-token")?.trim();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let includeRecoveryTests = true;
  try {
    const body = await request.json().catch(() => ({}));
    if (body && typeof body.includeRecoveryTests === "boolean") {
      includeRecoveryTests = body.includeRecoveryTests;
    }
  } catch {
    // no body
  }

  try {
    const result = await runProductionSecurityAudit({ includeRecoveryTests });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[building-union-power/security-audit]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Audit failed",
      },
      { status: 502 }
    );
  }
}
