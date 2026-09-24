import { ServerClient } from "postmark";

export async function sendMemberStoryNotification(options: {
  subject: string;
  htmlBody: string;
  textBody: string;
}): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.POSTMARK_SERVER_TOKEN?.trim();
  const from = process.env.POSTMARK_FROM_EMAIL?.trim();
  const to = process.env.MEMBER_STORY_NOTIFY_EMAIL?.trim();

  if (!token || !from || !to) {
    return {
      ok: false,
      error:
        "Email not configured (POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL, MEMBER_STORY_NOTIFY_EMAIL)",
    };
  }

  try {
    const client = new ServerClient(token);
    const result = await client.sendEmail({
      From: from,
      To: to,
      Subject: options.subject,
      HtmlBody: options.htmlBody,
      TextBody: options.textBody,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM?.trim() || "outbound",
    });
    if (result.ErrorCode && result.ErrorCode !== 0) {
      return { ok: false, error: result.Message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}
