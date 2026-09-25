import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "jbt_dc78_newsletter_session";
const MAX_AGE_SEC = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret =
    process.env.NEWSLETTER_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "NEWSLETTER_SESSION_SECRET (or SESSION_SECRET) must be at least 32 characters"
    );
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function validateNewsletterCredentials(
  email: string,
  password: string
): boolean {
  const adminEmail =
    process.env.NEWSLETTER_ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "";
  const adminPassword =
    process.env.NEWSLETTER_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) return false;
  return (
    safeEqual(email.trim().toLowerCase(), adminEmail.toLowerCase()) &&
    safeEqual(password, adminPassword)
  );
}

export async function createNewsletterSession(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), role: "newsletter-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(getSecret());
}

export async function getNewsletterSession(): Promise<{ email: string } | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "newsletter-admin") return null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function requireNewsletterSession(): Promise<{ email: string }> {
  const session = await getNewsletterSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export { COOKIE_NAME, MAX_AGE_SEC };
