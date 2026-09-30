import { z } from "zod";

/**
 * Server-side allowlist for geofence construction job applications.
 * Browser-supplied trade/sheetTab/source/formType are ignored — these win.
 */
export const GEOFENCE_FORM_CONFIG = {
  "glazier-paid-ad": {
    formKey: "glazier-paid-ad",
    spreadsheetName: "Geofence Construction",
    sheetTab: "Glaziers",
    trade: "Glazing",
    source: "paid ad",
    formType: "geofence-construction",
    geofencesFolderName: "Geofences",
  },
} as const;

export type GeofenceFormKey = keyof typeof GEOFENCE_FORM_CONFIG;
export type GeofenceFormConfig =
  (typeof GEOFENCE_FORM_CONFIG)[GeofenceFormKey];

export const GLAZIERS_HEADERS = [
  "Submitted At",
  "Submission ID",
  "First Name",
  "Last Name",
  "Full Name",
  "Email",
  "Phone Number",
  "Has Trade Experience",
  "Experience Length",
  "Call Availability",
  "Trade",
  "Source",
  "Form Type",
  "Status",
] as const;

/** Submitted option values match dc78-glazing-application-vercel.html */
export const EXPERIENCE_LENGTH_OPTIONS = [
  "0-3 months",
  "6 months",
  "1 year",
  "3 years",
  "5 years",
  "More than 5 years",
] as const;

export const CALL_AVAILABILITY_OPTIONS = [
  "Morning (8:00 AM - 11:00 AM)",
  "Midday (11:00 AM - 2:00 PM)",
  "Afternoon (2:00 PM - 5:00 PM)",
  "Evening (5:00 PM - 7:00 PM)",
  "Flexible / Any time",
] as const;

export const geofenceApplicationSchema = z
  .object({
    formKey: z
      .string()
      .min(1)
      .max(80)
      .optional()
      .default("glazier-paid-ad"),
    submissionId: z.string().min(8).max(80),
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    fullName: z.string().max(240).optional(),
    email: z.string().email().max(254),
    phone: z.string().min(7).max(40),
    hasTradeExperience: z.enum(["Yes", "No"]),
    experienceLength: z.string().max(80).optional().default(""),
    callAvailability: z.string().min(1).max(120),
    // Client may send these; server overrides from FORM_CONFIG
    trade: z.string().max(80).optional(),
    sheetTab: z.string().max(80).optional(),
    source: z.string().max(80).optional(),
    formType: z.string().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasTradeExperience === "Yes") {
      if (
        !EXPERIENCE_LENGTH_OPTIONS.includes(
          data.experienceLength as (typeof EXPERIENCE_LENGTH_OPTIONS)[number]
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Experience length is required when you have trade experience",
          path: ["experienceLength"],
        });
      }
    }
    if (
      !CALL_AVAILABILITY_OPTIONS.includes(
        data.callAvailability as (typeof CALL_AVAILABILITY_OPTIONS)[number]
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a valid call availability option",
        path: ["callAvailability"],
      });
    }
  });

export type GeofenceApplicationInput = z.infer<typeof geofenceApplicationSchema>;

export function resolveGeofenceFormConfig(
  formKey: string = "glazier-paid-ad"
): GeofenceFormConfig {
  const config = GEOFENCE_FORM_CONFIG[formKey as GeofenceFormKey];
  if (!config) {
    throw new Error("Unknown or unapproved geofence form");
  }
  return config;
}
