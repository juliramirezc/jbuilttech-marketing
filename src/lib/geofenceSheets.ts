import type { sheets_v4 } from "googleapis";
import {
  assertGoogleDriveConfigured,
  findOrCreateSharedDriveFolder,
  getDriveClient,
  getSheetsClient,
} from "@/lib/googleDrive";
import {
  headersForForm,
  type GeofenceFormConfig,
  type LeadSource,
} from "@/lib/geofenceForms";

function escapeSheetTitle(title: string): string {
  return title.replace(/'/g, "''");
}

async function findSpreadsheetInFolder(
  folderId: string,
  name: string
): Promise<string | null> {
  const drive = getDriveClient();
  const escaped = name.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name = '${escaped}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files?.[0]?.id ?? null;
}

async function createSpreadsheetInFolder(
  folderId: string,
  name: string
): Promise<string> {
  const drive = getDriveClient();
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  const id = created.data.id;
  if (!id) throw new Error(`Failed to create spreadsheet: ${name}`);
  return id;
}

async function listSheetTitles(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<{ sheetId: number; title: string }[]> {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  return (meta.data.sheets || [])
    .map((s) => ({
      sheetId: s.properties?.sheetId ?? -1,
      title: s.properties?.title || "",
    }))
    .filter((s) => s.sheetId >= 0 && s.title);
}

async function ensureTabWithHeaders(
  spreadsheetId: string,
  tabTitle: string,
  headers: readonly string[]
): Promise<void> {
  const sheets = getSheetsClient();
  const existing = await listSheetTitles(sheets, spreadsheetId);
  const found = existing.find(
    (s) => s.title.toLowerCase() === tabTitle.toLowerCase()
  );

  if (!found) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: tabTitle },
            },
          },
        ],
      },
    });
  }

  const range = `'${escapeSheetTitle(tabTitle)}'!A1:${columnLetter(headers.length)}1`;
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const current = headerRes.data.values?.[0] || [];
  const needsHeaders =
    current.length === 0 ||
    headers.some((h, i) => (current[i] || "").toString() !== h);

  if (needsHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${escapeSheetTitle(tabTitle)}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...headers]] },
    });
  }
}

function columnLetter(n: number): string {
  let result = "";
  let num = n;
  while (num > 0) {
    const rem = (num - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result || "A";
}

/**
 * Resolve Applications Construction folder → spreadsheet → trade tab.
 */
export async function ensureGeofenceConstructionSheet(
  config: GeofenceFormConfig
): Promise<{ spreadsheetId: string; sheetUrl: string }> {
  assertGoogleDriveConfigured();
  const headers = headersForForm(config);

  const pinned = process.env.GOOGLE_GEOFENCE_SPREADSHEET_ID?.trim();
  if (pinned) {
    await ensureTabWithHeaders(pinned, config.sheetTab, headers);
    return {
      spreadsheetId: pinned,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${pinned}`,
    };
  }

  const folderId = await findOrCreateSharedDriveFolder(config.driveFolderName);
  let spreadsheetId = await findSpreadsheetInFolder(
    folderId,
    config.spreadsheetName
  );
  if (!spreadsheetId) {
    spreadsheetId = await createSpreadsheetInFolder(
      folderId,
      config.spreadsheetName
    );
  }

  await ensureTabWithHeaders(spreadsheetId, config.sheetTab, headers);

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

/** Build the exact 9-cell row written to the Glaziers tab. */
export function buildGlaziersSheetRow(options: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityArea: string;
  hasTradeExperience: string;
  experienceLength: string;
  callAvailability: string;
  leadSource: LeadSource;
}): string[] {
  const experienceTime =
    options.hasTradeExperience === "Yes" ? options.experienceLength || "" : "";

  return [
    options.firstName,
    options.lastName,
    options.email,
    options.phone,
    options.cityArea,
    options.hasTradeExperience,
    experienceTime,
    options.callAvailability,
    options.leadSource,
  ];
}

/** Build the 9-cell row written to the Painting tab. */
export function buildPaintingSheetRow(options: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hasTradeExperience: string;
  experienceLength: string;
  callAvailability: string;
  leadSource: LeadSource;
  preferredProjectLocation: string;
}): string[] {
  const experienceTime =
    options.hasTradeExperience === "Yes" ? options.experienceLength || "" : "";

  return [
    options.firstName,
    options.lastName,
    options.email,
    options.phone,
    options.hasTradeExperience,
    experienceTime,
    options.callAvailability,
    options.leadSource,
    options.preferredProjectLocation,
  ];
}

export async function appendGeofenceApplicationRow(options: {
  spreadsheetId: string;
  sheetTab: string;
  headersKey: GeofenceFormConfig["headersKey"];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityArea?: string;
  preferredProjectLocation?: string;
  hasTradeExperience: string;
  experienceLength: string;
  callAvailability: string;
  leadSource: LeadSource;
}): Promise<void> {
  const sheets = getSheetsClient();
  const row =
    options.headersKey === "painting"
      ? buildPaintingSheetRow({
          firstName: options.firstName,
          lastName: options.lastName,
          email: options.email,
          phone: options.phone,
          hasTradeExperience: options.hasTradeExperience,
          experienceLength: options.experienceLength,
          callAvailability: options.callAvailability,
          leadSource: options.leadSource,
          preferredProjectLocation: options.preferredProjectLocation || "",
        })
      : buildGlaziersSheetRow({
          firstName: options.firstName,
          lastName: options.lastName,
          email: options.email,
          phone: options.phone,
          cityArea: options.cityArea || "",
          hasTradeExperience: options.hasTradeExperience,
          experienceLength: options.experienceLength,
          callAvailability: options.callAvailability,
          leadSource: options.leadSource,
        });

  await sheets.spreadsheets.values.append({
    spreadsheetId: options.spreadsheetId,
    range: `'${escapeSheetTitle(options.sheetTab)}'!A:I`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });
}
