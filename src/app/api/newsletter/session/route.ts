import { NextResponse } from "next/server";
import { getNewsletterSession } from "@/lib/newsletterAuth";
import { getNewsletterPublicConfig } from "@/lib/newsletterPostmark";

export const runtime = "nodejs";

export async function GET() {
  const session = await getNewsletterSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const config = getNewsletterPublicConfig();
    return NextResponse.json({
      authenticated: true,
      email: session.email,
      config,
    });
  } catch (err) {
    return NextResponse.json({
      authenticated: true,
      email: session.email,
      config: null,
      configError:
        err instanceof Error ? err.message : "Postmark config incomplete",
    });
  }
}
