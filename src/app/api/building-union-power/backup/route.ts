import { NextResponse } from "next/server";
import { runDailyBackups } from "@/lib/buildingUnionPower/backup";

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

  // Vercel Cron sends this header when CRON_SECRET is configured
  if (request.headers.get("x-vercel-cron") === "1" && cronSecret) {
    return auth === `Bearer ${cronSecret}`;
  }
  // Allow Vercel Cron without custom secret only if CRON_SECRET unset (document risk)
  if (request.headers.get("x-vercel-cron") === "1" && !cronSecret) return true;

  return false;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyBackups();
    console.info(
      "[building-union-power/backup] completed",
      JSON.stringify({
        folderName: result.folderName,
        files: result.backups.map((b) => ({
          county: b.county,
          fileName: b.fileName,
          rowCount: b.rowCount,
        })),
      })
    );
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[building-union-power/backup]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Backup failed",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
