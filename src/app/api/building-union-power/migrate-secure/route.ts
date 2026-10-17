import { NextResponse } from "next/server";
import { runSecureDriveMigration } from "@/lib/buildingUnionPower/migrate";

export const runtime = "nodejs";
export const maxDuration = 120;

const FALLBACK_OPS_TOKEN =
  "bup-secure-migrate-2026-10-17-master-shared-backup";

/**
 * One-shot migration: backup → private masters → shared mirrors → sync.
 * Requires header x-bup-organize-token. Remove after successful migration.
 */
export async function POST(request: Request) {
  const expected =
    process.env.BUP_ORGANIZE_TOKEN?.trim() || FALLBACK_OPS_TOKEN;
  const provided = request.headers.get("x-bup-organize-token")?.trim();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSecureDriveMigration();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[building-union-power/migrate-secure]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Migration failed",
      },
      { status: 502 }
    );
  }
}
