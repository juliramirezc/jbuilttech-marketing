/**
 * Building Union Power 2 class configurations.
 * Each county gets its own registration URL and dedicated spreadsheet.
 * Leon is defined for future reuse — do not publish a Leon route yet.
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
  sheetTab: string;
  driveFolderName: string;
  /** Optional env var that pins an existing spreadsheet ID */
  spreadsheetIdEnv: string;
};

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
  spreadsheetName: "Marion County Union Building Power clas",
  sheetTab: "Marion Registrations",
  driveFolderName: "Applications Public Sector",
  spreadsheetIdEnv: "GOOGLE_MARION_BUP_SPREADSHEET_ID",
};

/** Future Leon County class — config only; no page/API yet. */
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
  locationName: "Leon County Class Location",
  addressLine1: "2757 West Pensacola Street",
  addressLine2: "Tallahassee, Florida",
  spreadsheetName: "Leon County Union Building Power class",
  sheetTab: "Leon Registrations",
  driveFolderName: "Applications Public Sector",
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
  const location = `${config.locationName}, ${config.addressLine1}, ${config.addressLine2}`;
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
