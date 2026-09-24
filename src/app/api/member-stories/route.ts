import { NextResponse } from "next/server";
import {
  appendMemberStoryRow,
  assertGoogleDriveConfigured,
  driveFileUrl,
  driveFolderUrl,
  ensureMemberStorySheet,
  getMissingGoogleEnvNames,
  resolveMemberStorySubmissionFolder,
  submissionAlreadyRecorded,
  writeSubmissionJson,
} from "@/lib/googleDrive";
import { sendMemberStoryNotification } from "@/lib/mail";
import {
  clientIp,
  memberStorySchema,
  rateLimit,
} from "@/lib/memberStories";

export const runtime = "nodejs";
export const maxDuration = 60;

function isConfigError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("not configured") || msg.includes("missing:");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`member-stories:${ip}`, 20)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = memberStorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid phone number" },
      { status: 400 }
    );
  }

  const submittedAt = new Date().toISOString();
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName =
    data.fullName?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Member";

  try {
    assertGoogleDriveConfigured();

    const { rootFolderId, submissionFolderId } =
      await resolveMemberStorySubmissionFolder(data.submissionId);
    const { spreadsheetId, sheetUrl } =
      await ensureMemberStorySheet(rootFolderId);

    if (await submissionAlreadyRecorded(spreadsheetId, data.submissionId)) {
      return NextResponse.json({
        success: true,
        submissionId: data.submissionId,
        duplicate: true,
      });
    }

    const folderLink = driveFolderUrl(submissionFolderId);
    const media = data.media ?? [];
    const mediaUrls = media
      .map((m) => driveFileUrl(m.driveFileId))
      .join("\n");
    const mediaNames = media.map((m) => m.fileName).join(", ");

    const record = {
      submittedAt,
      submissionId: data.submissionId,
      firstName,
      lastName,
      fullName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      story: data.story ?? "",
      formType: data.formType,
      folderName: "Member-newsletter-stories",
      mediaCount: media.length,
      media,
      driveFolderId: submissionFolderId,
      driveFolderUrl: folderLink,
      sheetUrl,
      status: "New",
    };

    await writeSubmissionJson(submissionFolderId, record);
    await appendMemberStoryRow({
      spreadsheetId,
      submittedAt,
      submissionId: data.submissionId,
      firstName,
      lastName,
      email: record.email,
      phone: record.phone,
      story: record.story,
      mediaCount: media.length,
      mediaFileNames: mediaNames,
      driveFolderUrl: folderLink,
      mediaUrls,
    });

    const subject = `New DC 78 Member Story - ${fullName}`;
    const mediaListHtml =
      media.length === 0
        ? "<p>No media attached.</p>"
        : `<ul>${media
            .map(
              (m) =>
                `<li><a href="${driveFileUrl(m.driveFileId)}">${escapeHtml(m.fileName)}</a></li>`
            )
            .join("")}</ul>`;

    const htmlBody = `
      <h2>New DC 78 Member Story</h2>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <p><strong>Submission ID:</strong> ${escapeHtml(data.submissionId)}</p>
      <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(record.phone)}</p>
      <p><strong>Story:</strong></p>
      <p>${escapeHtml(record.story).replace(/\n/g, "<br/>")}</p>
      <p><strong>Media count:</strong> ${media.length}</p>
      <p><strong>Drive folder:</strong> <a href="${folderLink}">${folderLink}</a></p>
      ${mediaListHtml}
      <p><strong>Submissions sheet:</strong> <a href="${sheetUrl}">${sheetUrl}</a></p>
    `;

    const textBody = [
      "New DC 78 Member Story",
      `Submitted: ${submittedAt}`,
      `Submission ID: ${data.submissionId}`,
      `Name: ${fullName}`,
      `Email: ${record.email}`,
      `Phone: ${record.phone}`,
      "",
      "Story:",
      record.story,
      "",
      `Media count: ${media.length}`,
      `Drive folder: ${folderLink}`,
      `Media: ${mediaNames || "(none)"}`,
      `Sheet: ${sheetUrl}`,
    ].join("\n");

    const mail = await sendMemberStoryNotification({
      subject,
      htmlBody,
      textBody,
    });

    if (!mail.ok) {
      console.error("[member-stories] email failed after save:", mail.error);
    }

    return NextResponse.json({
      success: true,
      submissionId: data.submissionId,
      emailSent: mail.ok,
    });
  } catch (err) {
    console.error("[member-stories]", err);
    const message =
      err instanceof Error
        ? err.message
        : "Could not save member story submission";
    const configMissing = isConfigError(err);
    return NextResponse.json(
      {
        error: message,
        code: configMissing ? "google_config_missing" : "member_story_save_failed",
        missingEnv: configMissing ? getMissingGoogleEnvNames() : undefined,
      },
      { status: configMissing ? 503 : 502 }
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
