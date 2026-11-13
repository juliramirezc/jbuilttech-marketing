import { z } from "zod";

/**
 * Environment Variable Schema
 * Runtime validation for required environment variables
 */

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional()
);

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("https://jbuilttech.com"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_CALENDLY_URL: optionalUrl,
  NEXT_PUBLIC_GOOGLE_BOOKING_URL: optionalUrl,
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    NEXT_PUBLIC_CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL,
    NEXT_PUBLIC_GOOGLE_BOOKING_URL: process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();
