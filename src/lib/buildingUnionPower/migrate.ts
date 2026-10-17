import {
  BUILDING_UNION_POWER_REGISTRATION_HEADERS,
  BUP_BACKUP_FOLDER_NAME,
  BUP_MASTER_FOLDER_NAME,
  BUP_SHARED_FOLDER_NAME,
  LEON_CLASS,
  MARION_CLASS,
  type BuildingUnionPowerClassConfig,
} from "@/lib/buildingUnionPower/classes";
import { backupCountyMaster } from "@/lib/buildingUnionPower/backup";
import {
  createSpreadsheetInFolder,
  ensureMasterSpreadsheet,
  ensureSharedSpreadsheet,
  ensureTabWithHeaders,
  findOrCreateSharedDriveFolder,
  getFileMeta,
  renameAndMoveSpreadsheet,
  replaceSharedSheetFromMaster,
} from "@/lib/buildingUnionPower/sheets";
import { assertGoogleDriveConfigured } from "@/lib/googleDrive";

async function migrateCounty(config: BuildingUnionPowerClassConfig) {
  const backup = await backupCountyMaster(config);
  const master = await ensureMasterSpreadsheet(config);
  const sharedFolderId = await findOrCreateSharedDriveFolder(
    config.sharedFolderName
  );

  let shared = await ensureSharedSpreadsheet(config);

  // Never expose the master spreadsheet as the staff shared copy
  if (shared.spreadsheetId === master.spreadsheetId) {
    const newSharedId = await createSpreadsheetInFolder(
      sharedFolderId,
      config.sharedSpreadsheetName
    );
    await ensureTabWithHeaders(
      newSharedId,
      config.sheetTab,
      BUILDING_UNION_POWER_REGISTRATION_HEADERS
    );
    shared = {
      spreadsheetId: newSharedId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${newSharedId}`,
      folderId: sharedFolderId,
    };
  }

  const sync = await replaceSharedSheetFromMaster({
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: shared.spreadsheetId,
    sheetTab: config.sheetTab,
  });

  const masterMeta = await getFileMeta(master.spreadsheetId);
  if (masterMeta.parents.includes(sharedFolderId)) {
    const masterFolderId = await findOrCreateSharedDriveFolder(
      config.masterFolderName
    );
    await renameAndMoveSpreadsheet({
      fileId: master.spreadsheetId,
      targetName: config.masterSpreadsheetName,
      targetFolderId: masterFolderId,
    });
  }

  return {
    county: config.countyKey,
    backup,
    master: {
      spreadsheetId: master.spreadsheetId,
      sheetUrl: master.sheetUrl,
      name: config.masterSpreadsheetName,
    },
    shared: {
      spreadsheetId: shared.spreadsheetId,
      sheetUrl: shared.sheetUrl,
      name: config.sharedSpreadsheetName,
    },
    syncedRows: sync.rowCount,
  };
}

export async function runSecureDriveMigration() {
  assertGoogleDriveConfigured();

  const masterFolderId = await findOrCreateSharedDriveFolder(
    BUP_MASTER_FOLDER_NAME
  );
  const sharedFolderId = await findOrCreateSharedDriveFolder(
    BUP_SHARED_FOLDER_NAME
  );
  const backupFolderId = await findOrCreateSharedDriveFolder(
    BUP_BACKUP_FOLDER_NAME
  );

  const marion = await migrateCounty(MARION_CLASS);
  const leon = await migrateCounty(LEON_CLASS);

  return {
    success: true as const,
    folders: {
      master: {
        name: BUP_MASTER_FOLDER_NAME,
        id: masterFolderId,
        url: `https://drive.google.com/drive/folders/${masterFolderId}`,
      },
      shared: {
        name: BUP_SHARED_FOLDER_NAME,
        id: sharedFolderId,
        url: `https://drive.google.com/drive/folders/${sharedFolderId}`,
      },
      backup: {
        name: BUP_BACKUP_FOLDER_NAME,
        id: backupFolderId,
        url: `https://drive.google.com/drive/folders/${backupFolderId}`,
      },
    },
    marion,
    leon,
    note: "Pin shared spreadsheet IDs in Vercel via GOOGLE_MARION_BUP_SHARED_SPREADSHEET_ID and GOOGLE_LEON_BUP_SHARED_SPREADSHEET_ID.",
  };
}
