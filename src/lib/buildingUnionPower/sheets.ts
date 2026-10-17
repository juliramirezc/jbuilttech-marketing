import type { sheets_v4 } from "googleapis";
import {
  assertGoogleDriveConfigured,
  findOrCreateSharedDriveFolder,
  getDriveClient,
  getSheetsClient,
} from "@/lib/googleDrive";
import {
  BUILDING_UNION_POWER_REGISTRATION_HEADERS,
  BUP_PARENT_FOLDER_NAME,
  LEON_CLASS,
  MARION_CLASS,
  type BuildingUnionPowerClassConfig,
} from "@/lib/buildingUnionPower/classes";
import {
  asLiteralSheetText,
  formatNyTimestamp,
  type MarionRegistrationInput,
} from "@/lib/buildingUnionPower/schema";

function escapeSheetTitle(title: string): string {
  return title.replace(/'/g, "''");
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

async function findSpreadsheetInFolder(
  folderId: string,
  name: string
): Promise<{ id: string; name: string; parents: string[] } | null> {
  const drive = getDriveClient();
  const escaped = name.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name = '${escaped}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    fields: "files(id, name, parents)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const file = res.data.files?.[0];
  if (!file?.id) return null;
  return {
    id: file.id,
    name: file.name || name,
    parents: file.parents || [],
  };
}

async function findSpreadsheetByNameAnywhere(
  name: string
): Promise<{ id: string; name: string; parents: string[] } | null> {
  const drive = getDriveClient();
  const escaped = name.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `name = '${escaped}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    fields: "files(id, name, parents)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const file = res.data.files?.[0];
  if (!file?.id) return null;
  return {
    id: file.id,
    name: file.name || name,
    parents: file.parents || [],
  };
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

/**
 * Rename and/or move an existing spreadsheet in place.
 * Preserves file ID, contents, permissions, and worksheet data.
 */
async function renameAndMoveSpreadsheet(options: {
  fileId: string;
  targetName: string;
  targetFolderId: string;
  currentName: string;
  currentParents: string[];
}): Promise<void> {
  const drive = getDriveClient();
  const needsRename = options.currentName !== options.targetName;
  const alreadyInFolder = options.currentParents.includes(
    options.targetFolderId
  );

  if (!needsRename && alreadyInFolder) return;

  const removeParents = options.currentParents
    .filter((p) => p !== options.targetFolderId)
    .join(",");

  await drive.files.update({
    fileId: options.fileId,
    supportsAllDrives: true,
    addParents: alreadyInFolder ? undefined : options.targetFolderId,
    removeParents: removeParents || undefined,
    requestBody: needsRename ? { name: options.targetName } : {},
    fields: "id,name,parents",
  });
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
  let found = existing.find(
    (s) => s.title.toLowerCase() === tabTitle.toLowerCase()
  );

  // Prefer renaming default Sheet1 when the spreadsheet is brand new
  if (!found) {
    const sheet1 = existing.find((s) => s.title === "Sheet1");
    if (sheet1 && existing.length === 1) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheet1.sheetId,
                  title: tabTitle,
                },
                fields: "title",
              },
            },
          ],
        },
      });
      found = { sheetId: sheet1.sheetId, title: tabTitle };
    } else {
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
      const refreshed = await listSheetTitles(sheets, spreadsheetId);
      found = refreshed.find(
        (s) => s.title.toLowerCase() === tabTitle.toLowerCase()
      );
    }
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

  // Freeze header row
  const titles = await listSheetTitles(sheets, spreadsheetId);
  const tab = titles.find(
    (s) => s.title.toLowerCase() === tabTitle.toLowerCase()
  );
  if (tab) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: tab.sheetId,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });
  }
}

async function resolveExistingSpreadsheet(
  config: BuildingUnionPowerClassConfig,
  targetFolderId: string
): Promise<{ id: string; name: string; parents: string[] } | null> {
  // 1. Exact name in target folder
  const inTarget = await findSpreadsheetInFolder(
    targetFolderId,
    config.spreadsheetName
  );
  if (inTarget) return inTarget;

  // 2. Exact name anywhere on the shared drive
  const byNewName = await findSpreadsheetByNameAnywhere(config.spreadsheetName);
  if (byNewName) return byNewName;

  // 3. Legacy names in legacy folders, then anywhere
  const legacyNames = config.legacySpreadsheetNames || [];
  const legacyFolders = config.legacyDriveFolderNames || [];

  for (const legacyFolder of legacyFolders) {
    const folderId = await findOrCreateSharedDriveFolder(legacyFolder);
    for (const legacyName of legacyNames) {
      const found = await findSpreadsheetInFolder(folderId, legacyName);
      if (found) return found;
    }
  }

  for (const legacyName of legacyNames) {
    const found = await findSpreadsheetByNameAnywhere(legacyName);
    if (found) return found;
  }

  return null;
}

/**
 * Ensure the county spreadsheet exists under the configured parent folder
 * with the configured display name. Renames/moves existing files in place
 * (same spreadsheet ID) — never copies data into a new file.
 */
export async function ensureBuildingUnionPowerSheet(
  config: BuildingUnionPowerClassConfig = MARION_CLASS
): Promise<{ spreadsheetId: string; sheetUrl: string; folderName: string }> {
  assertGoogleDriveConfigured();

  const pinned = process.env[config.spreadsheetIdEnv]?.trim();
  if (pinned) {
    const targetFolderId = await findOrCreateSharedDriveFolder(
      config.driveFolderName
    );
    const drive = getDriveClient();
    const meta = await drive.files.get({
      fileId: pinned,
      supportsAllDrives: true,
      fields: "id,name,parents",
    });
    await renameAndMoveSpreadsheet({
      fileId: pinned,
      targetName: config.spreadsheetName,
      targetFolderId,
      currentName: meta.data.name || "",
      currentParents: meta.data.parents || [],
    });
    await ensureTabWithHeaders(
      pinned,
      config.sheetTab,
      BUILDING_UNION_POWER_REGISTRATION_HEADERS
    );
    return {
      spreadsheetId: pinned,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${pinned}`,
      folderName: config.driveFolderName,
    };
  }

  const folderId = await findOrCreateSharedDriveFolder(config.driveFolderName);
  const existing = await resolveExistingSpreadsheet(config, folderId);

  let spreadsheetId: string;
  if (existing) {
    await renameAndMoveSpreadsheet({
      fileId: existing.id,
      targetName: config.spreadsheetName,
      targetFolderId: folderId,
      currentName: existing.name,
      currentParents: existing.parents,
    });
    spreadsheetId = existing.id;
  } else {
    spreadsheetId = await createSpreadsheetInFolder(
      folderId,
      config.spreadsheetName
    );
  }

  await ensureTabWithHeaders(
    spreadsheetId,
    config.sheetTab,
    BUILDING_UNION_POWER_REGISTRATION_HEADERS
  );

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    folderName: config.driveFolderName,
  };
}

/** Organize both county sheets into the shared parent folder (idempotent). */
export async function organizeBuildingUnionPowerDrive(): Promise<{
  folderName: string;
  folderUrl: string;
  marion: { spreadsheetId: string; sheetUrl: string; spreadsheetName: string };
  leon: { spreadsheetId: string; sheetUrl: string; spreadsheetName: string };
}> {
  const folderId = await findOrCreateSharedDriveFolder(BUP_PARENT_FOLDER_NAME);
  const marion = await ensureBuildingUnionPowerSheet(MARION_CLASS);
  const leon = await ensureBuildingUnionPowerSheet(LEON_CLASS);

  return {
    folderName: BUP_PARENT_FOLDER_NAME,
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    marion: {
      spreadsheetId: marion.spreadsheetId,
      sheetUrl: marion.sheetUrl,
      spreadsheetName: MARION_CLASS.spreadsheetName,
    },
    leon: {
      spreadsheetId: leon.spreadsheetId,
      sheetUrl: leon.sheetUrl,
      spreadsheetName: LEON_CLASS.spreadsheetName,
    },
  };
}

export function buildMarionRegistrationRow(
  data: MarionRegistrationInput,
  submittedAt = formatNyTimestamp()
): string[] {
  return [
    submittedAt,
    asLiteralSheetText(data.fullName),
    asLiteralSheetText(data.cellphone),
    asLiteralSheetText(data.email || ""),
    asLiteralSheetText(data.employer),
    asLiteralSheetText(data.workLocation),
    asLiteralSheetText(data.jobTitle),
    asLiteralSheetText(data.unionMember),
    asLiteralSheetText(data.stewardOrOfficer),
    asLiteralSheetText(data.learnGoals || ""),
    asLiteralSheetText(data.accommodations || ""),
    asLiteralSheetText(data.reminderConsent),
  ];
}

export async function appendMarionRegistrationRow(options: {
  spreadsheetId: string;
  sheetTab: string;
  data: MarionRegistrationInput;
  submittedAt?: string;
}): Promise<void> {
  const sheets = getSheetsClient();
  const row = buildMarionRegistrationRow(
    options.data,
    options.submittedAt || formatNyTimestamp()
  );

  await sheets.spreadsheets.values.append({
    spreadsheetId: options.spreadsheetId,
    range: `'${escapeSheetTitle(options.sheetTab)}'!A:L`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row],
    },
  });
}
