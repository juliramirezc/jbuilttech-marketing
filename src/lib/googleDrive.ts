import { google, type drive_v3, type sheets_v4 } from "googleapis";
import { Readable } from "stream";

const MEMBER_STORY_FOLDER = "Member-newsletter-stories";
const MEMBER_STORY_SHEET_TITLE = "DC78 Member Story Submissions";
const ALLOWED_FOLDERS = new Set([MEMBER_STORY_FOLDER]);

export { MEMBER_STORY_FOLDER, MEMBER_STORY_SHEET_TITLE, ALLOWED_FOLDERS };

function getPrivateKey(): string {
  const raw = process.env.GOOGLE_PRIVATE_KEY?.trim();
  if (!raw) throw new Error("GOOGLE_PRIVATE_KEY is not configured");
  return raw.replace(/\\n/g, "\n");
}

function getServiceAccountEmail(): string {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  if (!email) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not configured");
  return email;
}

function getSharedDriveId(): string | undefined {
  return process.env.GOOGLE_SHARED_DRIVE_ID?.trim() || undefined;
}

export function getGoogleAuth(scopes: string[]) {
  return new google.auth.JWT({
    email: getServiceAccountEmail(),
    key: getPrivateKey(),
    scopes,
  });
}

export function getDriveClient(): drive_v3.Drive {
  const auth = getGoogleAuth([
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
  return google.drive({ version: "v3", auth });
}

export function getSheetsClient(): sheets_v4.Sheets {
  const auth = getGoogleAuth([
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
  return google.sheets({ version: "v4", auth });
}

type FolderLookupOptions = {
  name: string;
  parentId?: string;
};

async function findFolder(
  drive: drive_v3.Drive,
  { name, parentId }: FolderLookupOptions
): Promise<string | null> {
  const sharedDriveId = getSharedDriveId();
  const escaped = name.replace(/'/g, "\\'");
  const parts = [
    `name = '${escaped}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    "trashed = false",
  ];
  if (parentId) parts.push(`'${parentId}' in parents`);

  const res = await drive.files.list({
    q: parts.join(" and "),
    fields: "files(id, name)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: sharedDriveId ? "drive" : "user",
    driveId: sharedDriveId,
  });

  return res.data.files?.[0]?.id ?? null;
}

async function createFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const sharedDriveId = getSharedDriveId();
  const parents = parentId
    ? [parentId]
    : sharedDriveId
      ? [sharedDriveId]
      : undefined;

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents,
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const id = res.data.id;
  if (!id) throw new Error(`Failed to create Drive folder: ${name}`);
  return id;
}

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const existing = await findFolder(drive, { name, parentId });
  if (existing) return existing;
  return createFolder(drive, name, parentId);
}

/**
 * Resolve Member-newsletter-stories root (allowlisted), then submissionId child.
 */
export async function resolveMemberStorySubmissionFolder(
  submissionId: string
): Promise<{ rootFolderId: string; submissionFolderId: string }> {
  const drive = getDriveClient();
  const configuredRoot = process.env.GOOGLE_MEMBER_STORY_ROOT_FOLDER_ID?.trim();

  const rootFolderId =
    configuredRoot ||
    (await findOrCreateFolder(drive, MEMBER_STORY_FOLDER));

  const year = String(new Date().getFullYear());
  const yearFolderId = await findOrCreateFolder(drive, year, rootFolderId);
  const submissionFolderId = await findOrCreateFolder(
    drive,
    submissionId,
    yearFolderId
  );

  return { rootFolderId, submissionFolderId };
}

export async function resolveAllowlistedUploadParent(options: {
  folderName?: string;
  formType?: string;
  submissionId?: string;
}): Promise<string> {
  const folderName = options.folderName?.trim() || MEMBER_STORY_FOLDER;
  const formType = options.formType?.trim();

  if (
    formType === "member-newsletter-story" ||
    ALLOWED_FOLDERS.has(folderName)
  ) {
    if (!ALLOWED_FOLDERS.has(folderName)) {
      throw new Error("Invalid folderName for member story uploads");
    }
    if (!options.submissionId?.trim()) {
      throw new Error("submissionId is required for member story uploads");
    }
    const { submissionFolderId } = await resolveMemberStorySubmissionFolder(
      options.submissionId.trim()
    );
    return submissionFolderId;
  }

  throw new Error("Upload folder is not allowlisted");
}

export async function startResumableUpload(options: {
  parentFolderId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}): Promise<{ uploadUrl: string }> {
  const accessToken = await getAccessToken();
  const metadata = {
    name: sanitizeFileName(options.fileName),
    parents: [options.parentFolderId],
  };

  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": options.mimeType || "application/octet-stream",
        "X-Upload-Content-Length": String(options.fileSize),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    const detail = await initRes.text().catch(() => "");
    throw new Error(`Drive resumable init failed: ${initRes.status} ${detail}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) throw new Error("Drive did not return a resumable upload URL");
  return { uploadUrl };
}

async function getAccessToken(): Promise<string> {
  const auth = getGoogleAuth([
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
  const token = await auth.getAccessToken();
  const value = typeof token === "string" ? token : token?.token;
  if (!value) throw new Error("Could not obtain Google access token");
  return value;
}

export function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "upload.bin";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
}

export async function writeSubmissionJson(
  folderId: string,
  payload: unknown
): Promise<string> {
  const drive = getDriveClient();
  const body = JSON.stringify(payload, null, 2);

  // Replace existing submission.json if present
  const existing = await drive.files.list({
    q: `'${folderId}' in parents and name = 'submission.json' and trashed = false`,
    fields: "files(id)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const existingId = existing.data.files?.[0]?.id;

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: {
        mimeType: "application/json",
        body: Readable.from([body]),
      },
      supportsAllDrives: true,
    });
    return existingId;
  }

  const created = await drive.files.create({
    requestBody: {
      name: "submission.json",
      parents: [folderId],
      mimeType: "application/json",
    },
    media: {
      mimeType: "application/json",
      body: Readable.from([body]),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return created.data.id!;
}

export function driveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export function driveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export async function ensureMemberStorySheet(
  rootFolderId: string
): Promise<{ spreadsheetId: string; sheetUrl: string }> {
  const configured = process.env.GOOGLE_MEMBER_STORY_SHEET_ID?.trim();
  if (configured) {
    return {
      spreadsheetId: configured,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${configured}`,
    };
  }

  const drive = getDriveClient();
  const found = await drive.files.list({
    q: `'${rootFolderId}' in parents and name = '${MEMBER_STORY_SHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  let spreadsheetId = found.data.files?.[0]?.id;
  if (!spreadsheetId) {
    const created = await drive.files.create({
      requestBody: {
        name: MEMBER_STORY_SHEET_TITLE,
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: [rootFolderId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
    spreadsheetId = created.data.id!;
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:L1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "Submitted At",
            "Submission ID",
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Story",
            "Media Count",
            "Media File Names",
            "Drive Folder URL",
            "Media URLs",
            "Status",
          ],
        ],
      },
    });
  }

  return {
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

export async function appendMemberStoryRow(options: {
  spreadsheetId: string;
  submittedAt: string;
  submissionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  story: string;
  mediaCount: number;
  mediaFileNames: string;
  driveFolderUrl: string;
  mediaUrls: string;
}): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: options.spreadsheetId,
    range: "Sheet1!A:L",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          options.submittedAt,
          options.submissionId,
          options.firstName,
          options.lastName,
          options.email,
          options.phone,
          options.story,
          options.mediaCount,
          options.mediaFileNames,
          options.driveFolderUrl,
          options.mediaUrls,
          "New",
        ],
      ],
    },
  });
}

export async function submissionAlreadyRecorded(
  spreadsheetId: string,
  submissionId: string
): Promise<boolean> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!B:B",
  });
  const rows = res.data.values ?? [];
  return rows.some((row, idx) => idx > 0 && row[0] === submissionId);
}
