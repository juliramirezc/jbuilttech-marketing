import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  TRACKING_ISOLATION_HEADER,
  TRACKING_ISOLATION_VALUE,
  isTrackingIsolatedPath,
} from "@/lib/trackingIsolation";

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

function withTrackingIsolation(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (isTrackingIsolatedPath(request.nextUrl.pathname)) {
    response.headers.set(TRACKING_ISOLATION_HEADER, TRACKING_ISOLATION_VALUE);
    // Also set request header so Server Components in the same render can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(TRACKING_ISOLATION_HEADER, TRACKING_ISOLATION_VALUE);
    return NextResponse.next({
      request: { headers: requestHeaders },
      headers: response.headers,
    });
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Tracking isolation for Glass Fabrication careers (and any future isolated paths)
  if (isTrackingIsolatedPath(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(TRACKING_ISOLATION_HEADER, TRACKING_ISOLATION_VALUE);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set(TRACKING_ISOLATION_HEADER, TRACKING_ISOLATION_VALUE);
    return response;
  }

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
  return withTrackingIsolation(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/careers/glass-fabrication",
    "/careers/glass-fabrication/",
    "/dc78/newsletter",
    "/api/newsletter/:path*",
  ],
};
