import {
  BUP_BACKUP_FOLDER_NAME,
  BUP_MASTER_FOLDER_NAME,
  BUP_SHARED_FOLDER_NAME,
  LEON_CLASS,
  MARION_CLASS,
  type BuildingUnionPowerClassConfig,
} from "@/lib/buildingUnionPower/classes";
import {
  BUILDING_UNION_POWER_REGISTRATION_HEADERS,
} from "@/lib/buildingUnionPower/classes";
import {
  createRegistrationId,
  createSpreadsheetInFolder,
  ensureMasterSpreadsheet,
  ensureSharedSpreadsheet,
  ensureTabWithHeaders,
  findOrCreateSharedDriveFolder,
  getFileMeta,
  readAllDataRows,
  replaceSharedSheetFromMaster,
} from "@/lib/buildingUnionPower/sheets";
import {
  assertGoogleDriveConfigured,
  getDriveClient,
  getSheetsClient,
} from "@/lib/googleDrive";

function redactRow(row: string[]): Record<string, string> {
  return {
    registrationId: row[0] || "",
    timestamp: row[1] || "",
    fullName: row[2] ? "[REDACTED]" : "",
    cellphone: row[3] ? "[REDACTED]" : "",
    email: row[4] ? "[REDACTED]" : "",
    hasAccommodations: Boolean((row[11] || "").trim()) ? "yes" : "no",
    reminderConsent: row[12] || "",
    columnCount: String(row.length),
  };
}

async function listPermissions(fileId: string) {
  const drive = getDriveClient();
  try {
    const res = await drive.permissions.list({
      fileId,
      supportsAllDrives: true,
      fields:
        "permissions(id,type,role,emailAddress,domain,displayName,allowFileDiscovery)",
      pageSize: 100,
    });
    return (res.data.permissions || []).map((p) => ({
      id: p.id,
      type: p.type,
      role: p.role,
      emailAddress: p.emailAddress || null,
      domain: p.domain || null,
      displayName: p.displayName || null,
    }));
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "permissions_list_failed",
    };
  }
}

async function listRevisions(fileId: string) {
  const drive = getDriveClient();
  try {
    const res = await drive.revisions.list({
      fileId,
      fields: "revisions(id,modifiedTime,lastModifyingUser,keepForever,size)",
      pageSize: 25,
    });
    return (res.data.revisions || []).map((r) => ({
      id: r.id,
      modifiedTime: r.modifiedTime,
      lastModifyingUser:
        r.lastModifyingUser?.emailAddress ||
        r.lastModifyingUser?.displayName ||
        null,
      keepForever: r.keepForever || false,
    }));
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "revisions_list_failed",
    };
  }
}

async function searchLegacyNames(names: string[]) {
  const drive = getDriveClient();
  const found: Array<{
    searchedName: string;
    id: string;
    name: string;
    parents: string[];
    trashed?: boolean;
  }> = [];

  for (const name of names) {
    const escaped = name.replace(/'/g, "\\'");
    const res = await drive.files.list({
      q: `name = '${escaped}' and mimeType = 'application/vnd.google-apps.spreadsheet'`,
      fields: "files(id,name,parents,trashed)",
      pageSize: 10,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const f of res.data.files || []) {
      if (!f.id) continue;
      found.push({
        searchedName: name,
        id: f.id,
        name: f.name || "",
        parents: f.parents || [],
        trashed: Boolean(f.trashed),
      });
    }
  }
  return found;
}

async function inspectCounty(config: BuildingUnionPowerClassConfig) {
  const master = await ensureMasterSpreadsheet(config);
  const shared = await ensureSharedSpreadsheet(config);
  const masterRows = await readAllDataRows(master.spreadsheetId, config.sheetTab);
  const sharedRows = await readAllDataRows(shared.spreadsheetId, config.sheetTab);

  const masterIds = new Set(
    masterRows.map((r) => (r[0] || "").trim()).filter((id) => id.startsWith("bup_"))
  );
  const sharedIds = new Set(
    sharedRows.map((r) => (r[0] || "").trim()).filter((id) => id.startsWith("bup_"))
  );
  const missingInShared = [...masterIds].filter((id) => !sharedIds.has(id));
  const extraInShared = [...sharedIds].filter((id) => !masterIds.has(id));

  const headerProbe = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: master.spreadsheetId,
    range: `'${config.sheetTab.replace(/'/g, "''")}'!A1:M1`,
  });
  const headers = (headerProbe.data.values?.[0] || []).map(String);

  return {
    county: config.countyKey,
    master: {
      spreadsheetId: master.spreadsheetId,
      sheetUrl: master.sheetUrl,
      rowCount: masterRows.length,
      headers,
      hasRegistrationIdHeader: headers[0] === "Registration ID",
      sample: masterRows.slice(0, 5).map(redactRow),
      permissions: await listPermissions(master.spreadsheetId),
      revisions: await listRevisions(master.spreadsheetId),
      meta: await getFileMeta(master.spreadsheetId),
    },
    shared: {
      spreadsheetId: shared.spreadsheetId,
      sheetUrl: shared.sheetUrl,
      rowCount: sharedRows.length,
      sample: sharedRows.slice(0, 5).map(redactRow),
      permissions: await listPermissions(shared.spreadsheetId),
      meta: await getFileMeta(shared.spreadsheetId),
    },
    sync: {
      masterIds: masterIds.size,
      sharedIds: sharedIds.size,
      missingInSharedCount: missingInShared.length,
      extraInSharedCount: extraInShared.length,
      idsDiffer: master.spreadsheetId !== shared.spreadsheetId,
    },
    legacySearch: await searchLegacyNames([
      ...(config.legacySpreadsheetNames || []),
      config.masterSpreadsheetName,
      config.sharedSpreadsheetName,
    ]),
  };
}

async function inspectFolder(name: string, knownId?: string) {
  const id = knownId || (await findOrCreateSharedDriveFolder(name));
  const meta = await getFileMeta(id);
  const permissions = await listPermissions(id);
  const drive = getDriveClient();
  const children = await drive.files.list({
    q: `'${id}' in parents and trashed = false`,
    fields: "files(id,name,mimeType)",
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return {
    name,
    id,
    url: `https://drive.google.com/drive/folders/${id}`,
    meta,
    permissions,
    children: (children.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
    })),
  };
}

/**
 * Disposable recovery test — creates temporary shared sheet, mutates it,
 * reconciles from master, verifies master unchanged. Does NOT touch
 * production shared sheets' long-lived data beyond reading master.
 */
export async function runDisposableRecoveryTest(
  config: BuildingUnionPowerClassConfig
) {
  const master = await ensureMasterSpreadsheet(config);
  const masterBefore = await readAllDataRows(
    master.spreadsheetId,
    config.sheetTab
  );

  const folderId = await findOrCreateSharedDriveFolder(config.sharedFolderName);
  const disposableName = `DISPOSABLE RECOVERY TEST — ${config.countyKey} — ${Date.now()}`;
  const disposableId = await createSpreadsheetInFolder(folderId, disposableName);
  await ensureTabWithHeaders(
    disposableId,
    config.sheetTab,
    BUILDING_UNION_POWER_REGISTRATION_HEADERS
  );

  // Seed disposable with master snapshot
  await replaceSharedSheetFromMaster({
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: disposableId,
    sheetTab: config.sheetTab,
  });

  const sheets = getSheetsClient();
  const seeded = await readAllDataRows(disposableId, config.sheetTab);

  // Mutate: change a cell if rows exist, else append junk then delete via clear
  let mutationNotes: string[] = [];
  if (seeded.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: disposableId,
      range: `'${config.sheetTab.replace(/'/g, "''")}'!C2`,
      valueInputOption: "RAW",
      requestBody: { values: [["CORRUPTED_BY_RECOVERY_TEST"]] },
    });
    mutationNotes.push("corrupted_name_cell");
    // Delete last data row if >1, else clear all data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: disposableId,
      range: `'${config.sheetTab.replace(/'/g, "''")}'!A2:M2`,
    });
    mutationNotes.push("cleared_first_data_row");
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: disposableId,
      range: `'${config.sheetTab.replace(/'/g, "''")}'!A:M`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            createRegistrationId(),
            "junk",
            "SHOULD_BE_REMOVED",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ],
        ],
      },
    });
    mutationNotes.push("appended_junk_row");
  }

  const afterMutation = await readAllDataRows(disposableId, config.sheetTab);

  // Restore from master
  const restore = await replaceSharedSheetFromMaster({
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: disposableId,
    sheetTab: config.sheetTab,
  });

  const afterRestore = await readAllDataRows(disposableId, config.sheetTab);
  const masterAfter = await readAllDataRows(
    master.spreadsheetId,
    config.sheetTab
  );

  const masterUnchanged =
    JSON.stringify(masterBefore) === JSON.stringify(masterAfter);
  const restoredMatchesMaster =
    JSON.stringify(afterRestore) === JSON.stringify(masterAfter);

  // Trash disposable spreadsheet (not production shared)
  const drive = getDriveClient();
  await drive.files.update({
    fileId: disposableId,
    supportsAllDrives: true,
    requestBody: { trashed: true },
  });

  // Simulate deleted shared sheet recreation path on a second disposable
  const deletedSimName = `DISPOSABLE DELETED-SHARED SIM — ${config.countyKey} — ${Date.now()}`;
  const deletedSimId = await createSpreadsheetInFolder(
    folderId,
    deletedSimName
  );
  await ensureTabWithHeaders(
    deletedSimId,
    config.sheetTab,
    BUILDING_UNION_POWER_REGISTRATION_HEADERS
  );
  const recreated = await replaceSharedSheetFromMaster({
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: deletedSimId,
    sheetTab: config.sheetTab,
  });
  const recreatedMeta = await getFileMeta(deletedSimId);
  const recreatedInSharedFolder = recreatedMeta.parents.includes(folderId);
  await drive.files.update({
    fileId: deletedSimId,
    supportsAllDrives: true,
    requestBody: { trashed: true },
  });

  return {
    county: config.countyKey,
    masterSpreadsheetId: master.spreadsheetId,
    masterRowCountBefore: masterBefore.length,
    masterRowCountAfter: masterAfter.length,
    masterUnchanged,
    disposableId,
    mutationNotes,
    rowsAfterMutation: afterMutation.length,
    restoreRowCount: restore.rowCount,
    restoredMatchesMaster,
    deletedSharedRecreation: {
      recreatedId: deletedSimId,
      rowCount: recreated.rowCount,
      placedInSharedFolder: recreatedInSharedFolder,
      trashedAfterTest: true,
    },
    productionSharedUntouched: true,
  };
}

export async function runProductionSecurityAudit(options?: {
  includeRecoveryTests?: boolean;
}) {
  assertGoogleDriveConfigured();

  const marion = await inspectCounty(MARION_CLASS);
  const leon = await inspectCounty(LEON_CLASS);

  const folders = {
    master: await inspectFolder(
      BUP_MASTER_FOLDER_NAME,
      "1rUYtk9vG0Ft9WXoZIzqIH2djIApnv6mr"
    ),
    shared: await inspectFolder(
      BUP_SHARED_FOLDER_NAME,
      "1AUBBKgFIVodNeBBQSF_EbSDb29b5f9fg"
    ),
    backup: await inspectFolder(
      BUP_BACKUP_FOLDER_NAME,
      "1Eix8zuDptiawbZMfJvmFUiPfvNWtHrdJ"
    ),
  };

  // Check for duplicate shared folder from earlier organize
  let oldSharedFolder: unknown = null;
  try {
    oldSharedFolder = await inspectFolder(
      BUP_SHARED_FOLDER_NAME,
      "18F3vJu3st5z7a_qVknma-9fkn3I0zXPh"
    );
  } catch (err) {
    oldSharedFolder = {
      id: "18F3vJu3st5z7a_qVknma-9fkn3I0zXPh",
      error: err instanceof Error ? err.message : "unavailable",
    };
  }

  // Backup folder CSV inventory
  const drive = getDriveClient();
  const backupFiles = await drive.files.list({
    q: `'${folders.backup.id}' in parents and trashed = false`,
    fields: "files(id,name,createdTime,mimeType,size)",
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    orderBy: "createdTime desc",
  });

  let recovery: unknown = null;
  if (options?.includeRecoveryTests) {
    recovery = {
      marion: await runDisposableRecoveryTest(MARION_CLASS),
      leon: await runDisposableRecoveryTest(LEON_CLASS),
    };
  }

  const cronSecretConfigured = Boolean(process.env.CRON_SECRET?.trim());
  const organizeTokenConfigured = Boolean(
    process.env.BUP_ORGANIZE_TOKEN?.trim()
  );

  return {
    generatedAt: new Date().toISOString(),
    counties: { marion, leon },
    folders,
    oldSharedFolder,
    backups: {
      folderId: folders.backup.id,
      files: (backupFiles.data.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        createdTime: f.createdTime,
        mimeType: f.mimeType,
        size: f.size,
      })),
    },
    env: {
      cronSecretConfigured,
      organizeTokenConfigured,
      marionMasterEnvSet: Boolean(
        process.env.GOOGLE_MARION_BUP_SPREADSHEET_ID?.trim()
      ),
      leonMasterEnvSet: Boolean(
        process.env.GOOGLE_LEON_BUP_SPREADSHEET_ID?.trim()
      ),
      marionSharedEnvSet: Boolean(
        process.env.GOOGLE_MARION_BUP_SHARED_SPREADSHEET_ID?.trim()
      ),
      leonSharedEnvSet: Boolean(
        process.env.GOOGLE_LEON_BUP_SHARED_SPREADSHEET_ID?.trim()
      ),
      // never return secret values
    },
    idSeparation: {
      marionMasterVsShared:
        marion.master.spreadsheetId !== marion.shared.spreadsheetId,
      leonMasterVsShared:
        leon.master.spreadsheetId !== leon.shared.spreadsheetId,
      marionVsLeonMasters:
        marion.master.spreadsheetId !== leon.master.spreadsheetId,
      marionVsLeonShared:
        marion.shared.spreadsheetId !== leon.shared.spreadsheetId,
    },
    recovery,
  };
}
