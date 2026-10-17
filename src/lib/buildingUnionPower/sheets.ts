import type { sheets_v4 } from "googleapis";
import {
  assertGoogleDriveConfigured,
  findOrCreateSharedDriveFolder,
  getDriveClient,
  getSheetsClient,
} from "@/lib/googleDrive";
import {
  BUILDING_UNION_POWER_REGISTRATION_HEADERS,
  LEGACY_REGISTRATION_HEADERS_WITHOUT_ID,
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

export function createRegistrationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `bup_${crypto.randomUUID()}`;
  }
  return `bup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

type DriveFileRef = { id: string; name: string; parents: string[] };

async function findSpreadsheetInFolder(
  folderId: string,
  name: string
): Promise<DriveFileRef | null> {
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
): Promise<DriveFileRef | null> {
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

async function getFileMeta(fileId: string): Promise<DriveFileRef> {
  const drive = getDriveClient();
  const meta = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: "id,name,parents",
  });
  return {
    id: meta.data.id || fileId,
    name: meta.data.name || "",
    parents: meta.data.parents || [],
  };
}

export async function renameAndMoveSpreadsheet(options: {
  fileId: string;
  targetName: string;
  targetFolderId: string;
}): Promise<DriveFileRef> {
  const drive = getDriveClient();
  const current = await getFileMeta(options.fileId);
  const needsRename = current.name !== options.targetName;
  const alreadyInFolder = current.parents.includes(options.targetFolderId);
  if (!needsRename && alreadyInFolder) return current;

  const removeParents = current.parents
    .filter((p) => p !== options.targetFolderId)
    .join(",");

  const updated = await drive.files.update({
    fileId: options.fileId,
    supportsAllDrives: true,
    addParents: alreadyInFolder ? undefined : options.targetFolderId,
    removeParents: removeParents || undefined,
    requestBody: needsRename ? { name: options.targetName } : {},
    fields: "id,name,parents",
  });

  return {
    id: updated.data.id || options.fileId,
    name: updated.data.name || options.targetName,
    parents: updated.data.parents || [],
  };
}

export async function createSpreadsheetInFolder(
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

export async function ensureTabWithHeaders(
  spreadsheetId: string,
  tabTitle: string,
  headers: readonly string[]
): Promise<void> {
  const sheets = getSheetsClient();
  const existing = await listSheetTitles(sheets, spreadsheetId);
  let found = existing.find(
    (s) => s.title.toLowerCase() === tabTitle.toLowerCase()
  );

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

  // Migrate legacy header (no Registration ID) by inserting column A.
  const isLegacy =
    current.length > 0 &&
    current[0]?.toString() === LEGACY_REGISTRATION_HEADERS_WITHOUT_ID[0] &&
    current[0]?.toString() !== headers[0];

  if (isLegacy && found) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: found.sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 1,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });
    // Assign stable IDs to existing data rows
    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${escapeSheetTitle(tabTitle)}'!A2:A`,
    });
    const rowCount = dataRes.data.values?.length || 0;
    if (rowCount > 0) {
      const ids = Array.from({ length: rowCount }, () => [
        createRegistrationId(),
      ]);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${escapeSheetTitle(tabTitle)}'!A2`,
        valueInputOption: "RAW",
        requestBody: { values: ids },
      });
    }
  }

  const headerRes2 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapeSheetTitle(tabTitle)}'!A1:${columnLetter(headers.length)}1`,
  });
  const current2 = headerRes2.data.values?.[0] || [];
  const needsHeaders =
    current2.length === 0 ||
    headers.some((h, i) => (current2[i] || "").toString() !== h);

  if (needsHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${escapeSheetTitle(tabTitle)}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...headers]] },
    });
  }

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

function resolveMasterId(config: BuildingUnionPowerClassConfig): string | null {
  return (
    process.env[config.masterSpreadsheetIdEnv]?.trim() ||
    config.knownMasterSpreadsheetId ||
    null
  );
}

function resolveSharedId(config: BuildingUnionPowerClassConfig): string | null {
  return process.env[config.sharedSpreadsheetIdEnv]?.trim() || null;
}

async function locateLegacyMaster(
  config: BuildingUnionPowerClassConfig
): Promise<DriveFileRef | null> {
  const names = [
    config.masterSpreadsheetName,
    config.sharedSpreadsheetName,
    ...(config.legacySpreadsheetNames || []),
  ];
  for (const name of names) {
    const found = await findSpreadsheetByNameAnywhere(name);
    if (found) return found;
  }
  return null;
}

export async function ensureMasterSpreadsheet(
  config: BuildingUnionPowerClassConfig
): Promise<{ spreadsheetId: string; sheetUrl: string; folderId: string }> {
  assertGoogleDriveConfigured();
  const folderId = await findOrCreateSharedDriveFolder(config.masterFolderName);

  let spreadsheetId = resolveMasterId(config);
  if (spreadsheetId) {
    await renameAndMoveSpreadsheet({
      fileId: spreadsheetId,
      targetName: config.masterSpreadsheetName,
      targetFolderId: folderId,
    });
  } else {
    const existing =
      (await findSpreadsheetInFolder(folderId, config.masterSpreadsheetName)) ||
      (await locateLegacyMaster(config));
    if (existing) {
      await renameAndMoveSpreadsheet({
        fileId: existing.id,
        targetName: config.masterSpreadsheetName,
        targetFolderId: folderId,
      });
      spreadsheetId = existing.id;
    } else {
      spreadsheetId = await createSpreadsheetInFolder(
        folderId,
        config.masterSpreadsheetName
      );
    }
  }

  await ensureTabWithHeaders(
    spreadsheetId,
    config.sheetTab,
    BUILDING_UNION_POWER_REGISTRATION_HEADERS
  );

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    folderId,
  };
}

export async function ensureSharedSpreadsheet(
  config: BuildingUnionPowerClassConfig
): Promise<{ spreadsheetId: string; sheetUrl: string; folderId: string }> {
  assertGoogleDriveConfigured();
  const folderId = await findOrCreateSharedDriveFolder(config.sharedFolderName);

  let spreadsheetId: string | undefined = resolveSharedId(config) || undefined;
  if (spreadsheetId) {
    try {
      await getFileMeta(spreadsheetId);
      await renameAndMoveSpreadsheet({
        fileId: spreadsheetId,
        targetName: config.sharedSpreadsheetName,
        targetFolderId: folderId,
      });
    } catch {
      // Shared sheet was deleted — recreate below
      spreadsheetId = undefined;
    }
  }

  if (!spreadsheetId) {
    const existing = await findSpreadsheetInFolder(
      folderId,
      config.sharedSpreadsheetName
    );
    if (existing) {
      // Do not reuse a file that is actually the master
      const masterId = resolveMasterId(config);
      if (masterId && existing.id === masterId) {
        spreadsheetId = await createSpreadsheetInFolder(
          folderId,
          config.sharedSpreadsheetName
        );
      } else {
        spreadsheetId = existing.id;
      }
    } else {
      spreadsheetId = await createSpreadsheetInFolder(
        folderId,
        config.sharedSpreadsheetName
      );
    }
  }

  await ensureTabWithHeaders(
    spreadsheetId,
    config.sheetTab,
    BUILDING_UNION_POWER_REGISTRATION_HEADERS
  );

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    folderId,
  };
}

/** @deprecated Prefer ensureMasterSpreadsheet — kept for gradual migration. */
export async function ensureBuildingUnionPowerSheet(
  config: BuildingUnionPowerClassConfig
): Promise<{ spreadsheetId: string; sheetUrl: string; folderName: string }> {
  const master = await ensureMasterSpreadsheet(config);
  return {
    spreadsheetId: master.spreadsheetId,
    sheetUrl: master.sheetUrl,
    folderName: config.masterFolderName,
  };
}

export function buildRegistrationRow(
  data: MarionRegistrationInput,
  options: { registrationId: string; submittedAt?: string }
): string[] {
  const submittedAt = options.submittedAt || formatNyTimestamp();
  return [
    asLiteralSheetText(options.registrationId),
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

/** @deprecated use buildRegistrationRow */
export function buildMarionRegistrationRow(
  data: MarionRegistrationInput,
  submittedAt = formatNyTimestamp()
): string[] {
  return buildRegistrationRow(data, {
    registrationId: createRegistrationId(),
    submittedAt,
  });
}

export async function readAllDataRows(
  spreadsheetId: string,
  sheetTab: string
): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapeSheetTitle(sheetTab)}'!A2:M`,
  });
  return (res.data.values || []).map((row) =>
    row.map((cell) => (cell == null ? "" : String(cell)))
  );
}

export async function findRowByRegistrationId(
  spreadsheetId: string,
  sheetTab: string,
  registrationId: string
): Promise<number | null> {
  const rows = await readAllDataRows(spreadsheetId, sheetTab);
  const idx = rows.findIndex((r) => (r[0] || "").trim() === registrationId);
  return idx >= 0 ? idx + 2 : null; // 1-indexed sheet row
}

export async function appendRegistrationRow(options: {
  spreadsheetId: string;
  sheetTab: string;
  row: string[];
}): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: options.spreadsheetId,
    range: `'${escapeSheetTitle(options.sheetTab)}'!A:M`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [options.row] },
  });
}

/** @deprecated use appendRegistrationRow */
export async function appendMarionRegistrationRow(options: {
  spreadsheetId: string;
  sheetTab: string;
  data: MarionRegistrationInput;
  submittedAt?: string;
}): Promise<void> {
  const row = buildRegistrationRow(options.data, {
    registrationId: createRegistrationId(),
    submittedAt: options.submittedAt,
  });
  await appendRegistrationRow({
    spreadsheetId: options.spreadsheetId,
    sheetTab: options.sheetTab,
    row,
  });
}

export async function replaceSharedSheetFromMaster(options: {
  masterSpreadsheetId: string;
  sharedSpreadsheetId: string;
  sheetTab: string;
}): Promise<{ rowCount: number }> {
  const sheets = getSheetsClient();
  const masterRows = await readAllDataRows(
    options.masterSpreadsheetId,
    options.sheetTab
  );

  // Clear shared data (keep header)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: options.sharedSpreadsheetId,
    range: `'${escapeSheetTitle(options.sheetTab)}'!A2:M`,
  });

  if (masterRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: options.sharedSpreadsheetId,
      range: `'${escapeSheetTitle(options.sheetTab)}'!A2`,
      valueInputOption: "RAW",
      requestBody: { values: masterRows },
    });
  }

  return { rowCount: masterRows.length };
}

export { findOrCreateSharedDriveFolder, findSpreadsheetInFolder, getFileMeta };
