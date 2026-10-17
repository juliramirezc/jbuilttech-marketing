/**
 * Building Union Power 2 class configurations.
 * Each county has: private MASTER spreadsheet, staff SHARED spreadsheet,
 * and daily CSV backups — masters are authoritative.
 */

export type BuildingUnionPowerClassConfig = {
  countyKey: "marion" | "leon";
  formKey: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  dateIso: string;
  timeLabel: string;
  startTimeEt: string;
  endTimeEt: string;
  locationName: string;
  addressLine1: string;
  addressLine2: string;
  /** Private authoritative spreadsheet display name */
  masterSpreadsheetName: string;
  /** Staff-facing shared spreadsheet display name */
  sharedSpreadsheetName: string;
  /** Prior titles used to locate existing files during migration */
  legacySpreadsheetNames?: readonly string[];
  sheetTab: string;
  masterFolderName: string;
  sharedFolderName: string;
  backupFolderName: string;
  /** Env var pinning the private master spreadsheet ID */
  masterSpreadsheetIdEnv: string;
  /** Env var pinning the staff shared spreadsheet ID */
  sharedSpreadsheetIdEnv: string;
  /** Known production master ID (fallback when env unset) */
  knownMasterSpreadsheetId?: string;
  /** Known production shared ID (fallback when env unset) */
  knownSharedSpreadsheetId?: string;
};

export const BUP_MASTER_FOLDER_NAME =
  "JBuilttech - Building Union Power Master";
export const BUP_SHARED_FOLDER_NAME = "Union Building Power Classes";
export const BUP_BACKUP_FOLDER_NAME =
  "JBuilttech - Building Union Power Backups";

/** @deprecated use BUP_SHARED_FOLDER_NAME */
export const BUP_PARENT_FOLDER_NAME = BUP_SHARED_FOLDER_NAME;

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
  masterSpreadsheetName:
    "Marion County Union Building Power Class — October 24, 2026 — MASTER",
  sharedSpreadsheetName:
    "Marion County Union Building Power Class — October 24, 2026",
  legacySpreadsheetNames: [
    "Marion County Union Building Power Class — October 24, 2026",
    "Marion County Union Building Power clas",
  ],
  sheetTab: "Marion Registrations",
  masterFolderName: BUP_MASTER_FOLDER_NAME,
  sharedFolderName: BUP_SHARED_FOLDER_NAME,
  backupFolderName: BUP_BACKUP_FOLDER_NAME,
  masterSpreadsheetIdEnv: "GOOGLE_MARION_BUP_SPREADSHEET_ID",
  sharedSpreadsheetIdEnv: "GOOGLE_MARION_BUP_SHARED_SPREADSHEET_ID",
  knownMasterSpreadsheetId: "1LMxTk_oi2Sw2XkBNZ3-AyWjbextl74pa3sM3JzoRC68",
  knownSharedSpreadsheetId: "1Kn3fGoHAHq5Fbko9dETEX0vnehXxM520eLlExEmNVc0",
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
  locationName: "",
  addressLine1: "2757 West Pensacola Street",
  addressLine2: "Tallahassee, Florida",
  masterSpreadsheetName:
    "Leon County Union Building Power Class — November 7, 2026 — MASTER",
  sharedSpreadsheetName:
    "Leon County Union Building Power Class — November 7, 2026",
  legacySpreadsheetNames: [
    "Leon County Union Building Power Class — November 7, 2026",
    "Leon County Union Building Power clas",
  ],
  sheetTab: "Leon Registrations",
  masterFolderName: BUP_MASTER_FOLDER_NAME,
  sharedFolderName: BUP_SHARED_FOLDER_NAME,
  backupFolderName: BUP_BACKUP_FOLDER_NAME,
  masterSpreadsheetIdEnv: "GOOGLE_LEON_BUP_SPREADSHEET_ID",
  sharedSpreadsheetIdEnv: "GOOGLE_LEON_BUP_SHARED_SPREADSHEET_ID",
  knownMasterSpreadsheetId: "1HvYv5SbPuwof0d0jKTwHzlF4JjPjjfg_JEUhippIlUU",
  knownSharedSpreadsheetId: "1C_5ZoN7Ol5rtt35A6ooW4ZTdD8pFZ85PdQUbzfadJ-I",
};

/** Spreadsheet headers including internal registration ID (column A). */
export const BUILDING_UNION_POWER_REGISTRATION_HEADERS = [
  "Registration ID",
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

/** @deprecated alias */
export const MARION_REGISTRATION_HEADERS =
  BUILDING_UNION_POWER_REGISTRATION_HEADERS;

/** Legacy header row before Registration ID was added. */
export const LEGACY_REGISTRATION_HEADERS_WITHOUT_ID = [
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
