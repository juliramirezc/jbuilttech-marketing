import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jbt_dc78_newsletter_session";

function getSecret(): Uint8Array | null {
  const secret =
    process.env.NEWSLETTER_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

async function hasValidNewsletterSession(
  request: NextRequest
): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (
      payload.role === "newsletter-admin" && typeof payload.email === "string"
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isNewsletterPage = pathname === "/dc78/newsletter";
  const isNewsletterApi = pathname.startsWith("/api/newsletter/");
  const isLoginApi = pathname === "/api/newsletter/login";

  if (!isNewsletterPage && !isNewsletterApi) {
    return NextResponse.next();
  }

  if (isLoginApi) {
    return NextResponse.next();
  }

  const ok = await hasValidNewsletterSession(request);
  if (ok) {
    return NextResponse.next();
  }

  if (isNewsletterApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page: allow render so the client can show the login form.
  // API routes remain blocked without a session.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dc78/newsletter", "/api/newsletter/:path*"],
};
