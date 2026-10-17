import { NextResponse } from "next/server";
import { reconcileAllCounties } from "@/lib/buildingUnionPower/sync";

export const runtime = "nodejs";
export const maxDuration = 120;

function authorize(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization")?.trim();
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const ops =
    process.env.BUP_ORGANIZE_TOKEN?.trim() ||
    "bup-secure-migrate-2026-10-17-master-shared-backup";
  if (request.headers.get("x-bup-organize-token")?.trim() === ops) return true;

  if (request.headers.get("x-vercel-cron") === "1") {
    if (!cronSecret) return true;
    return auth === `Bearer ${cronSecret}`;
  }
  return false;
}

/**
 * Rebuild shared spreadsheets from private masters (recovery / nightly reconcile).
 */
export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await reconcileAllCounties();
    console.info(
      "[building-union-power/reconcile] completed",
      JSON.stringify({
        marionRows: result.marion.rowCount,
        leonRows: result.leon.rowCount,
      })
    );
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[building-union-power/reconcile]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Reconcile failed",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
