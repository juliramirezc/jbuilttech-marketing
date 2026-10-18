import { z } from "zod";

/**
 * Server-side allowlist for construction job applications.
 * Browser-supplied trade/sheetTab/destination fields are ignored — these win.
 */
export const GEOFENCE_FORM_CONFIG = {
  "glazier-paid-ad": {
    formKey: "glazier-paid-ad",
    spreadsheetName: "Applications Construction",
    sheetTab: "Glaziers",
    trade: "Glazing",
    formType: "geofence-construction",
    driveFolderName: "Applications Construction",
    headersKey: "glaziers" as const,
  },
  "painter-industrial": {
    formKey: "painter-industrial",
    spreadsheetName: "Applications Construction",
    sheetTab: "Painting",
    trade: "Painting",
    formType: "geofence-construction",
    driveFolderName: "Applications Construction",
    headersKey: "painting" as const,
  },
  "drywall-finisher": {
    formKey: "drywall-finisher",
    spreadsheetName: "Applications Construction",
    sheetTab: "Drywall",
    trade: "Drywall",
    formType: "geofence-construction",
    driveFolderName: "Applications Construction",
    headersKey: "drywall" as const,
  },
  "wall-covering": {
    formKey: "wall-covering",
    spreadsheetName: "Applications Construction",
    sheetTab: "Wall Covering",
    trade: "Wall Covering",
    formType: "geofence-construction",
    driveFolderName: "Applications Construction",
    headersKey: "wall-covering" as const,
  },
} as const;

export type GeofenceFormKey = keyof typeof GEOFENCE_FORM_CONFIG;
export type GeofenceFormConfig =
  (typeof GEOFENCE_FORM_CONFIG)[GeofenceFormKey];

/** Exact Glaziers tab headers — do not change. */
export const GLAZIERS_HEADERS = [
  "Name",
  "Last name",
  "Email",
  "Phone Number",
  "City / Area",
  "Experience on Trade (Yes/No)",
  "Experience time",
  "Availability for call",
  "Paid/ Organic",
] as const;

/**
 * Shared column layout for Painting / Drywall / Wall Covering tabs
 * (no City/Area; Preferred Project Location in column I).
 */
export const LOCATION_TRADE_HEADERS = [
  "Name",
  "Last name",
  "Email",
  "Phone Number",
  "Experience on Trade (Yes/No)",
  "Experience time",
  "Availability for call",
  "Paid/ Organic",
  "Preferred Project Location",
] as const;

/** @deprecated Prefer LOCATION_TRADE_HEADERS — kept for existing imports. */
export const PAINTING_HEADERS = LOCATION_TRADE_HEADERS;

export const CITY_AREA_OPTIONS = [
  "Fort Myers",
  "Naples",
  "Tampa",
  "Sarasota",
  "Orlando",
  "Panama City",
  "Tallahassee",
  "Other",
] as const;

export type CityAreaOption = (typeof CITY_AREA_OPTIONS)[number];

/** Industrial Painter location options. */
export const PROJECT_LOCATION_OPTIONS = [
  "Tampa, FL",
  "Jacksonville, FL",
  "Other",
] as const;

export type ProjectLocationOption =
  (typeof PROJECT_LOCATION_OPTIONS)[number];

/** Drywall / Wall Covering location options (Tampa, St. Pete, Other). */
export const DRYWALL_PROJECT_LOCATION_OPTIONS = [
  "Tampa, FL",
  "St. Petersburg, FL",
  "Other",
] as const;

export type DrywallProjectLocationOption =
  (typeof DRYWALL_PROJECT_LOCATION_OPTIONS)[number];

/** Same locations as Drywall — shared Tampa / St. Petersburg / Other set. */
export const WALL_COVERING_PROJECT_LOCATION_OPTIONS =
  DRYWALL_PROJECT_LOCATION_OPTIONS;

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

export type LeadSource = "Paid" | "Organic";

/** Normalize utm_medium → Paid | Organic (server-side only). */
export function resolveLeadSource(utmMedium?: string | null): LeadSource {
  const normalizedMedium = utmMedium?.trim().toLowerCase();
  return normalizedMedium === "paid" ? "Paid" : "Organic";
}

/**
 * Resolve the city written to the sheet.
 * Predefined selections are written as-is; Other uses the trimmed custom city.
 */
export function resolveCityArea(
  cityArea: string,
  customCity?: string | null
): string | null {
  const selected = cityArea.trim();
  if (
    !CITY_AREA_OPTIONS.includes(selected as CityAreaOption) ||
    selected === ""
  ) {
    return null;
  }
  if (selected === "Other") {
    const custom = (customCity || "").trim();
    return custom.length > 0 ? custom : null;
  }
  return selected;
}

/**
 * Resolve preferred project location for location-based trades.
 * Predefined cities written as-is; Other uses the trimmed custom location.
 */
export function resolveProjectLocation(
  preferredProjectLocation?: string | null,
  customProjectLocation?: string | null,
  allowedOptions: readonly string[] = PROJECT_LOCATION_OPTIONS
): string | null {
  const selected = (preferredProjectLocation || "").trim();
  if (!allowedOptions.includes(selected) || selected === "") {
    return null;
  }
  if (selected === "Other") {
    const custom = (customProjectLocation || "").trim();
    return custom.length > 0 ? custom : null;
  }
  return selected;
}

export function locationOptionsForForm(
  formKey: string
): readonly string[] | null {
  if (formKey === "painter-industrial") return PROJECT_LOCATION_OPTIONS;
  if (formKey === "drywall-finisher") return DRYWALL_PROJECT_LOCATION_OPTIONS;
  if (formKey === "wall-covering") return WALL_COVERING_PROJECT_LOCATION_OPTIONS;
  return null;
}

export function usesLocationTradeSheet(
  headersKey: GeofenceFormConfig["headersKey"]
): boolean {
  return (
    headersKey === "painting" ||
    headersKey === "drywall" ||
    headersKey === "wall-covering"
  );
}

export function headersForForm(config: GeofenceFormConfig): readonly string[] {
  if (usesLocationTradeSheet(config.headersKey)) {
    return LOCATION_TRADE_HEADERS;
  }
  return GLAZIERS_HEADERS;
}

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
    /** Required for Glaziers; ignored for location-trade forms. */
    cityArea: z.string().max(120).optional().default(""),
    customCity: z.string().max(120).optional().default(""),
    /** Required for Painting/Drywall; ignored for Glaziers. */
    preferredProjectLocation: z.string().max(120).optional().default(""),
    customProjectLocation: z.string().max(120).optional().default(""),
    hasTradeExperience: z.enum(["Yes", "No"]),
    experienceLength: z.string().max(80).optional().default(""),
    callAvailability: z.string().min(1).max(120),
    /** From URL `utm_medium`; server normalizes to Paid/Organic. */
    utmMedium: z.string().max(80).optional(),
    // Client may send these; server overrides from FORM_CONFIG
    trade: z.string().max(80).optional(),
    sheetTab: z.string().max(80).optional(),
    source: z.string().max(80).optional(),
    formType: z.string().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    const formKey = data.formKey || "glazier-paid-ad";
    const locationOptions = locationOptionsForForm(formKey);

    if (locationOptions) {
      if (!locationOptions.includes(data.preferredProjectLocation || "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select which location you are applying for",
          path: ["preferredProjectLocation"],
        });
      } else if (data.preferredProjectLocation === "Other") {
        if (!(data.customProjectLocation || "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter your preferred location",
            path: ["customProjectLocation"],
          });
        }
      }
    } else {
      if (
        !CITY_AREA_OPTIONS.includes(data.cityArea as CityAreaOption)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a valid area",
          path: ["cityArea"],
        });
      } else if (data.cityArea === "Other") {
        if (!(data.customCity || "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter your city",
            path: ["customCity"],
          });
        }
      }
    }

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
