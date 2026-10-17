import {
  BUP_BACKUP_FOLDER_NAME,
  LEON_CLASS,
  MARION_CLASS,
  BUILDING_UNION_POWER_REGISTRATION_HEADERS,
  type BuildingUnionPowerClassConfig,
} from "@/lib/buildingUnionPower/classes";
import {
  ensureMasterSpreadsheet,
  readAllDataRows,
} from "@/lib/buildingUnionPower/sheets";
import {
  findOrCreateSharedDriveFolder,
  getDriveClient,
} from "@/lib/googleDrive";
import { Readable } from "stream";

function nyDateStamp(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToCsv(rows: string[][]): string {
  const header = [...BUILDING_UNION_POWER_REGISTRATION_HEADERS];
  const lines = [header.map(csvEscape).join(",")];
  for (const row of rows) {
    const normalized = [
      ...row,
      ...Array(Math.max(0, header.length - row.length)).fill(""),
    ].slice(0, header.length);
    lines.push(normalized.map((c) => csvEscape(String(c ?? ""))).join(","));
  }
  return lines.join("\n") + "\n";
}

async function uploadCsvBackup(options: {
  folderId: string;
  fileName: string;
  csv: string;
}): Promise<{ fileId: string; webViewLink?: string }> {
  const drive = getDriveClient();
  const created = await drive.files.create({
    requestBody: {
      name: options.fileName,
      parents: [options.folderId],
      mimeType: "text/csv",
    },
    media: {
      mimeType: "text/csv",
      body: Readable.from([options.csv]),
    },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });
  if (!created.data.id) throw new Error(`Failed to upload backup ${options.fileName}`);
  return { fileId: created.data.id, webViewLink: created.data.webViewLink || undefined };
}

async function pruneOldBackups(
  folderId: string,
  prefix: string,
  keepDays: number
): Promise<number> {
  const drive = getDriveClient();
  const escaped = prefix.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name contains '${escaped}' and trashed = false`,
    fields: "files(id, name, createdTime)",
    pageSize: 200,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    orderBy: "createdTime desc",
  });
  const files = res.data.files || [];
  if (files.length <= keepDays) return 0;

  const toDelete = files.slice(keepDays);
  let deleted = 0;
  for (const file of toDelete) {
    if (!file.id) continue;
    await drive.files.update({
      fileId: file.id,
      supportsAllDrives: true,
      requestBody: { trashed: true },
    });
    deleted += 1;
  }
  return deleted;
}

export async function backupCountyMaster(
  config: BuildingUnionPowerClassConfig
): Promise<{
  county: string;
  fileName: string;
  fileId: string;
  rowCount: number;
}> {
  const master = await ensureMasterSpreadsheet(config);
  const rows = await readAllDataRows(master.spreadsheetId, config.sheetTab);
  const folderId = await findOrCreateSharedDriveFolder(
    config.backupFolderName || BUP_BACKUP_FOLDER_NAME
  );
  const stamp = nyDateStamp();
  const countyLabel =
    config.countyKey === "marion" ? "Marion" : "Leon";
  const fileName = `${countyLabel}-Registrations-${stamp}.csv`;
  const csv = rowsToCsv(rows);
  const uploaded = await uploadCsvBackup({ folderId, fileName, csv });
  await pruneOldBackups(folderId, `${countyLabel}-Registrations-`, 30);

  return {
    county: config.countyKey,
    fileName,
    fileId: uploaded.fileId,
    rowCount: rows.length,
  };
}

export async function runDailyBackups(): Promise<{
  folderName: string;
  backups: Awaited<ReturnType<typeof backupCountyMaster>>[];
}> {
  const backups = [
    await backupCountyMaster(MARION_CLASS),
    await backupCountyMaster(LEON_CLASS),
  ];
  return { folderName: BUP_BACKUP_FOLDER_NAME, backups };
}
