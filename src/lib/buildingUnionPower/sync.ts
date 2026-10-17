import {
  LEON_CLASS,
  MARION_CLASS,
  type BuildingUnionPowerClassConfig,
} from "@/lib/buildingUnionPower/classes";
import {
  appendRegistrationRow,
  buildRegistrationRow,
  createRegistrationId,
  ensureMasterSpreadsheet,
  ensureSharedSpreadsheet,
  findRowByRegistrationId,
  readAllDataRows,
  replaceSharedSheetFromMaster,
} from "@/lib/buildingUnionPower/sheets";
import {
  formatNyTimestamp,
  type MarionRegistrationInput,
} from "@/lib/buildingUnionPower/schema";

export type SaveRegistrationResult = {
  success: true;
  registrationId: string;
  masterSpreadsheetId: string;
  sharedSynced: boolean;
  sharedSyncError?: string;
  duplicate?: boolean;
};

/**
 * Authoritative write path:
 * 1) Ensure master exists
 * 2) Idempotent append to master by registration ID
 * 3) Best-effort sync row to shared (failure does not roll back master)
 * Success is returned only after master persistence is confirmed.
 */
export async function saveRegistrationToMasterAndSync(options: {
  config: BuildingUnionPowerClassConfig;
  data: MarionRegistrationInput;
  registrationId?: string;
  submittedAt?: string;
}): Promise<SaveRegistrationResult> {
  const registrationId = options.registrationId || createRegistrationId();
  const submittedAt = options.submittedAt || formatNyTimestamp();
  const row = buildRegistrationRow(options.data, {
    registrationId,
    submittedAt,
  });

  const master = await ensureMasterSpreadsheet(options.config);

  const existingRow = await findRowByRegistrationId(
    master.spreadsheetId,
    options.config.sheetTab,
    registrationId
  );

  if (existingRow == null) {
    await appendRegistrationRow({
      spreadsheetId: master.spreadsheetId,
      sheetTab: options.config.sheetTab,
      row,
    });
  }

  let sharedSynced = false;
  let sharedSyncError: string | undefined;

  try {
    const shared = await ensureSharedSpreadsheet(options.config);
    const sharedExisting = await findRowByRegistrationId(
      shared.spreadsheetId,
      options.config.sheetTab,
      registrationId
    );
    if (sharedExisting == null) {
      await appendRegistrationRow({
        spreadsheetId: shared.spreadsheetId,
        sheetTab: options.config.sheetTab,
        row,
      });
    }
    sharedSynced = true;
  } catch (err) {
    sharedSyncError =
      err instanceof Error ? err.message : "shared_sync_failed";
    console.error(
      `[bup-sync] shared sync failed for ${options.config.countyKey}`,
      sharedSyncError
    );
  }

  return {
    success: true,
    registrationId,
    masterSpreadsheetId: master.spreadsheetId,
    sharedSynced,
    sharedSyncError,
    duplicate: existingRow != null,
  };
}

/** Rebuild shared sheet entirely from master (safe recovery). */
export async function reconcileSharedFromMaster(
  config: BuildingUnionPowerClassConfig
): Promise<{
  masterSpreadsheetId: string;
  sharedSpreadsheetId: string;
  rowCount: number;
}> {
  const master = await ensureMasterSpreadsheet(config);
  const shared = await ensureSharedSpreadsheet(config);
  const { rowCount } = await replaceSharedSheetFromMaster({
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: shared.spreadsheetId,
    sheetTab: config.sheetTab,
  });
  return {
    masterSpreadsheetId: master.spreadsheetId,
    sharedSpreadsheetId: shared.spreadsheetId,
    rowCount,
  };
}

export async function reconcileAllCounties(): Promise<{
  marion: Awaited<ReturnType<typeof reconcileSharedFromMaster>>;
  leon: Awaited<ReturnType<typeof reconcileSharedFromMaster>>;
}> {
  const marion = await reconcileSharedFromMaster(MARION_CLASS);
  const leon = await reconcileSharedFromMaster(LEON_CLASS);
  return { marion, leon };
}

/** Incremental sync: append any master rows missing from shared (by Registration ID). */
export async function syncMissingSharedRows(
  config: BuildingUnionPowerClassConfig
): Promise<{ appended: number }> {
  const master = await ensureMasterSpreadsheet(config);
  const shared = await ensureSharedSpreadsheet(config);
  const masterRows = await readAllDataRows(
    master.spreadsheetId,
    config.sheetTab
  );
  const sharedRows = await readAllDataRows(
    shared.spreadsheetId,
    config.sheetTab
  );
  const sharedIds = new Set(
    sharedRows.map((r) => (r[0] || "").trim()).filter(Boolean)
  );

  let appended = 0;
  for (const row of masterRows) {
    const id = (row[0] || "").trim();
    if (!id || sharedIds.has(id)) continue;
    const normalized = [
      ...row,
      ...Array(Math.max(0, 13 - row.length)).fill(""),
    ].slice(0, 13);
    await appendRegistrationRow({
      spreadsheetId: shared.spreadsheetId,
      sheetTab: config.sheetTab,
      row: normalized,
    });
    sharedIds.add(id);
    appended += 1;
  }
  return { appended };
}
