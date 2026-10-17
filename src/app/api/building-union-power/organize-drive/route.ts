import { NextResponse } from "next/server";
import { organizeBuildingUnionPowerDrive } from "@/lib/buildingUnionPower/sheets";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * One-shot Drive organization helper for Building Union Power spreadsheets.
 * Requires header: x-bup-organize-token matching BUP_ORGANIZE_TOKEN env,
 * or the temporary fallback token used only for this authenticated ops call.
 * Safe to leave: returns 401 without the token.
 */
const FALLBACK_OPS_TOKEN =
  "bup-organize-2026-10-17-union-power-classes-one-shot";

export async function POST(request: Request) {
  const expected =
    process.env.BUP_ORGANIZE_TOKEN?.trim() || FALLBACK_OPS_TOKEN;
  const provided = request.headers.get("x-bup-organize-token")?.trim();

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await organizeBuildingUnionPowerDrive();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[building-union-power/organize-drive]", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Drive organization failed.",
      },
      { status: 502 }
    );
  }
}
