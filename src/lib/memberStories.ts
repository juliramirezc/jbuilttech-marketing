import { z } from "zod";

const mediaItemSchema = z.object({
  driveFileId: z.string().min(1).max(200),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().nonnegative().optional(),
  mimeType: z.string().max(120).optional(),
});

export const memberStorySchema = z.object({
  submissionId: z.string().min(8).max(80),
  firstName: z.string().max(120).optional().default(""),
  lastName: z.string().max(120).optional().default(""),
  fullName: z.string().max(240).optional(),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(40),
  story: z.string().max(20000).optional().default(""),
  folderName: z.literal("Member-newsletter-stories").optional(),
  formType: z.literal("member-newsletter-story"),
  media: z.array(mediaItemSchema).max(30).optional().default([]),
});

export type MemberStoryPayload = z.infer<typeof memberStorySchema>;

export const uploadInitSchema = z.object({
  name: z.string().max(240).optional(),
  email: z.string().email().max(254),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(2_000_000_000),
  mimeType: z.string().max(120).optional(),
  folderName: z.string().max(120).optional(),
  formType: z.string().max(80).optional(),
  submissionId: z.string().min(8).max(80),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  story: z.string().max(20000).optional(),
});

const ALLOWED_EXT =
  /\.(heic|heif|jpg|jpeg|png|gif|webp|mov|mp4|m4v|webm|3gp)$/i;

export function isAllowedMedia(fileName: string, mimeType?: string): boolean {
  const type = (mimeType || "").toLowerCase();
  if (type.startsWith("image/") || type.startsWith("video/")) return true;
  return ALLOWED_EXT.test(fileName);
}

export function normalizeMimeType(fileName: string, mimeType?: string): string {
  if (mimeType) return mimeType;
  const name = fileName.toLowerCase();
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".heif")) return "image/heif";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".3gp")) return "video/3gpp";
  if (/\.(jpg|jpeg)$/i.test(name)) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

/** Very light in-memory rate limit (per serverless isolate). */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit = 40,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
