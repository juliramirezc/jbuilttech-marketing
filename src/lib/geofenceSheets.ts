import type { sheets_v4 } from "googleapis";
import {
  assertGoogleDriveConfigured,
  findOrCreateSharedDriveFolder,
  getDriveClient,
  getSheetsClient,
} from "@/lib/googleDrive";
import {
  GLAZIERS_HEADERS,
  type GeofenceFormConfig,
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
      requestBody: { values: [ [...headers] ] },
    });
  }

  // If spreadsheet was brand new with default "Sheet1" and we added a trade tab,
  // leave Sheet1 alone — future trades will add their own tabs.
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
 * Resolve Geofences folder → Geofence Construction spreadsheet → trade tab.
 */
export async function ensureGeofenceConstructionSheet(
  config: GeofenceFormConfig
): Promise<{ spreadsheetId: string; sheetUrl: string }> {
  assertGoogleDriveConfigured();

  const pinned = process.env.GOOGLE_GEOFENCE_SPREADSHEET_ID?.trim();
  if (pinned) {
    await ensureTabWithHeaders(pinned, config.sheetTab, GLAZIERS_HEADERS);
    return {
      spreadsheetId: pinned,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${pinned}`,
    };
  }

  const folderId = await findOrCreateSharedDriveFolder(
    config.geofencesFolderName
  );
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

  await ensureTabWithHeaders(spreadsheetId, config.sheetTab, GLAZIERS_HEADERS);

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

export async function geofenceSubmissionAlreadyRecorded(
  spreadsheetId: string,
  sheetTab: string,
  submissionId: string
): Promise<boolean> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapeSheetTitle(sheetTab)}'!B:B`,
  });
  const rows = res.data.values ?? [];
  return rows.some((row, idx) => idx > 0 && row[0] === submissionId);
}

export async function appendGeofenceApplicationRow(options: {
  spreadsheetId: string;
  sheetTab: string;
  submittedAt: string;
  submissionId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  hasTradeExperience: string;
  experienceLength: string;
  callAvailability: string;
  trade: string;
  source: string;
  formType: string;
}): Promise<void> {
  const sheets = getSheetsClient();
  const experienceLength =
    options.hasTradeExperience === "Yes" ? options.experienceLength || "" : "";

  await sheets.spreadsheets.values.append({
    spreadsheetId: options.spreadsheetId,
    range: `'${escapeSheetTitle(options.sheetTab)}'!A:N`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          options.submittedAt,
          options.submissionId,
          options.firstName,
          options.lastName,
          options.fullName,
          options.email,
          options.phone,
          options.hasTradeExperience,
          experienceLength,
          options.callAvailability,
          options.trade,
          options.source,
          options.formType,
          "New",
        ],
      ],
    },
  });
}
