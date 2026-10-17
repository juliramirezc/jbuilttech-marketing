/**
 * Building Union Power 2 class configurations.
 * Each county gets its own registration URL and dedicated spreadsheet.
 */

export type BuildingUnionPowerClassConfig = {
  countyKey: "marion" | "leon";
  formKey: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  /** ISO-like local date YYYY-MM-DD for calendar links */
  dateIso: string;
  timeLabel: string;
  /** Start time HH:mm in America/New_York (24h) for calendar */
  startTimeEt: string;
  /** End time HH:mm in America/New_York (24h) for calendar */
  endTimeEt: string;
  locationName: string;
  addressLine1: string;
  addressLine2: string;
  spreadsheetName: string;
  /** Prior spreadsheet titles to find before renaming (never create duplicates). */
  legacySpreadsheetNames?: readonly string[];
  sheetTab: string;
  driveFolderName: string;
  /** Prior parent folders where the sheet may currently live. */
  legacyDriveFolderNames?: readonly string[];
  /** Optional env var that pins an existing spreadsheet ID */
  spreadsheetIdEnv: string;
};

export const BUP_PARENT_FOLDER_NAME = "Union Building Power Classes";

export const MARION_CLASS: BuildingUnionPowerClassConfig = {
  countyKey: "marion",
  formKey: "building-union-power-marion",
  title: "Building Union Power 2",
  subtitle: "Marion County — Class Registration",
  dateLabel: "Saturday, October 24, 2026",
  dateIso: "2026-10-24",
  timeLabel: "1:00 PM ET",
  startTimeEt: "13:00",
  endTimeEt: "15:00",
  locationName: "Marion Public Library",
  addressLine1: "2720 E Silver Springs Blvd",
  addressLine2: "Ocala, FL 34470",
  spreadsheetName:
    "Marion County Union Building Power Class — October 24, 2026",
  legacySpreadsheetNames: ["Marion County Union Building Power clas"],
  sheetTab: "Marion Registrations",
  driveFolderName: BUP_PARENT_FOLDER_NAME,
  legacyDriveFolderNames: ["Applications Public Sector"],
  spreadsheetIdEnv: "GOOGLE_MARION_BUP_SPREADSHEET_ID",
};

export const LEON_CLASS: BuildingUnionPowerClassConfig = {
  countyKey: "leon",
  formKey: "building-union-power-leon",
  title: "Building Union Power 2",
  subtitle: "Leon County — Class Registration",
  dateLabel: "Saturday, November 7, 2026",
  dateIso: "2026-11-07",
  timeLabel: "9:00 AM ET",
  startTimeEt: "09:00",
  endTimeEt: "11:00",
  // Venue name / ZIP not provided — leave blank; do not invent.
  locationName: "",
  addressLine1: "2757 West Pensacola Street",
  addressLine2: "Tallahassee, Florida",
  spreadsheetName:
    "Leon County Union Building Power Class — November 7, 2026",
  legacySpreadsheetNames: ["Leon County Union Building Power clas"],
  sheetTab: "Leon Registrations",
  driveFolderName: BUP_PARENT_FOLDER_NAME,
  legacyDriveFolderNames: ["Applications Public Sector"],
  spreadsheetIdEnv: "GOOGLE_LEON_BUP_SPREADSHEET_ID",
};

export const BUILDING_UNION_POWER_REGISTRATION_HEADERS = [
  "Submission Timestamp",
  "Full Name",
  "Cellphone Number",
  "Email Address",
  "Employer / School District",
  "School or Work Location",
  "Job Title",
  "Union Member",
  "Steward or Officer",
  "What Would You Like to Learn",
  "Language Assistance / Accommodations",
  "Reminder Consent",
] as const;

export const MARION_REGISTRATION_HEADERS =
  BUILDING_UNION_POWER_REGISTRATION_HEADERS;

export function buildGoogleCalendarUrl(
  config: BuildingUnionPowerClassConfig
): string {
  const start = `${config.dateIso.replace(/-/g, "")}T${config.startTimeEt.replace(":", "")}00`;
  const end = `${config.dateIso.replace(/-/g, "")}T${config.endTimeEt.replace(":", "")}00`;
  const locationParts = [
    config.locationName,
    config.addressLine1,
    config.addressLine2,
  ].filter((part) => part.trim());
  const location = locationParts.join(", ");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${config.title} — ${config.subtitle.replace(" — Class Registration", "")}`,
    dates: `${start}/${end}`,
    ctz: "America/New_York",
    location,
    details: `${config.title}\n${config.subtitle}\n${config.dateLabel}\n${config.timeLabel}\n${location}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
