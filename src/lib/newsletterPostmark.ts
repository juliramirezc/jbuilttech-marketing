/**
 * Server-only Postmark Broadcast Bulk helpers for /dc78/newsletter.
 * Uses POST /email/bulk only — no silent fallback to batch APIs.
 */

export type BulkRecipient = {
  email: string;
  firstName?: string;
  lastName?: string;
};

export type BulkSubmitResult = {
  ok: true;
  bulkId: string;
  status: string;
  totalMessages: number;
  releasedCount: number;
  failedCount: number;
  percentageCompleted: number;
  campaignTag: string;
};

export type BulkErrorResult = {
  ok: false;
  error: string;
  errorCode?: number;
  bulkApiUnavailable?: boolean;
  details?: unknown;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getNewsletterPostmarkConfig() {
  const alias = process.env.POSTMARK_TEMPLATE_ALIAS?.trim();
  const idRaw = process.env.POSTMARK_TEMPLATE_ID?.trim();
  if (!alias && !idRaw) {
    throw new Error("Set POSTMARK_TEMPLATE_ALIAS or POSTMARK_TEMPLATE_ID");
  }
  return {
    token: requireEnv("POSTMARK_SERVER_TOKEN"),
    fromEmail: requireEnv("POSTMARK_FROM_EMAIL"),
    fromName: process.env.POSTMARK_FROM_NAME?.trim() || "JBuiltTech",
    replyTo:
      process.env.POSTMARK_REPLY_TO_EMAIL?.trim() ||
      requireEnv("POSTMARK_FROM_EMAIL"),
    templateAlias: alias || null,
    templateId: idRaw ? Number(idRaw) : null,
    messageStream:
      process.env.POSTMARK_BROADCAST_STREAM?.trim() ||
      "public-sector-newsletter",
    campaignTagBase:
      process.env.POSTMARK_CAMPAIGN_TAG?.trim() || "public-sector-newsletter",
  };
}

/** Safe subset for authenticated UI (never includes token). */
export function getNewsletterPublicConfig() {
  const cfg = getNewsletterPostmarkConfig();
  return {
    fromEmail: cfg.fromEmail,
    fromName: cfg.fromName,
    replyTo: cfg.replyTo,
    templateAlias: cfg.templateAlias,
    templateId: cfg.templateId,
    messageStream: cfg.messageStream,
    campaignTagBase: cfg.campaignTagBase,
  };
}

export function createCampaignTag(kind: "test" | "full"): string {
  const base = getNewsletterPostmarkConfig().campaignTagBase;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${kind}-${stamp}-${suffix}`.slice(0, 1000);
}

function fromAddress(): string {
  const cfg = getNewsletterPostmarkConfig();
  return cfg.fromName ? `${cfg.fromName} <${cfg.fromEmail}>` : cfg.fromEmail;
}

function buildMessages(recipients: BulkRecipient[]) {
  return recipients.map((r) => {
    const firstName = r.firstName?.trim() || "";
    const lastName = r.lastName?.trim() || "";
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ") || r.email;
    return {
      To: r.email,
      TemplateModel: {
        first_name: firstName,
        last_name: lastName,
        firstName,
        lastName,
        full_name: fullName,
        fullName,
        email: r.email,
        name: fullName,
      },
    };
  });
}

function isBulkApiUnavailable(status: number, body: { ErrorCode?: number; Message?: string }): boolean {
  if (body.ErrorCode === 14) return true;
  const msg = (body.Message || "").toLowerCase();
  if (status === 422 && msg.includes("bulk") && msg.includes("approval")) {
    return true;
  }
  if (msg.includes("requires approval to access") && msg.includes("bulk")) {
    return true;
  }
  return false;
}

/**
 * Submit one Broadcast Bulk request. Does not fall back to batch APIs.
 */
export async function submitBroadcastBulk(options: {
  recipients: BulkRecipient[];
  campaignTag: string;
  kind: "test" | "full";
}): Promise<BulkSubmitResult | BulkErrorResult> {
  if (options.recipients.length === 0) {
    return { ok: false, error: "No recipients to send" };
  }

  for (const r of options.recipients) {
    if (!r.email || r.email.includes(",")) {
      return {
        ok: false,
        error: "Each recipient must have exactly one email address",
      };
    }
  }

  let cfg;
  try {
    cfg = getNewsletterPostmarkConfig();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Postmark is not configured",
    };
  }

  const payload: Record<string, unknown> = {
    From: fromAddress(),
    ReplyTo: cfg.replyTo,
    MessageStream: cfg.messageStream,
    TrackOpens: true,
    Tag: options.campaignTag,
    Messages: buildMessages(options.recipients),
    Metadata: {
      send_kind: options.kind,
      app: "jbuilttech-marketing-dc78-newsletter",
    },
  };

  if (cfg.templateAlias) {
    payload.TemplateAlias = cfg.templateAlias;
  } else if (cfg.templateId != null && Number.isFinite(cfg.templateId)) {
    payload.TemplateId = cfg.templateId;
  }

  const res = await fetch("https://api.postmarkapp.com/email/bulk", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": cfg.token,
    },
    body: JSON.stringify(payload),
  });

  const body = (await res.json().catch(() => ({}))) as {
    Id?: string;
    Status?: string;
    TotalMessages?: number;
    ReleasedCount?: number;
    FailedCount?: number;
    PercentageCompleted?: number;
    ErrorCode?: number;
    Message?: string;
    Errors?: unknown;
  };

  if (!res.ok) {
    const unavailable = isBulkApiUnavailable(res.status, body);
    return {
      ok: false,
      error: unavailable
        ? "Postmark Broadcast Bulk API is not enabled on this account (ErrorCode 14). Contact Postmark support to approve Bulk API access. This app will not fall back to another send method."
        : body.Message || `Postmark Bulk API error (HTTP ${res.status})`,
      errorCode: body.ErrorCode,
      bulkApiUnavailable: unavailable,
      details: body.Errors ?? body,
    };
  }

  if (!body.Id) {
    return {
      ok: false,
      error: "Postmark Bulk API did not return a request Id",
      details: body,
    };
  }

  return {
    ok: true,
    bulkId: body.Id,
    status: body.Status || "Accepted",
    totalMessages: body.TotalMessages ?? options.recipients.length,
    releasedCount: body.ReleasedCount ?? 0,
    failedCount: body.FailedCount ?? 0,
    percentageCompleted: body.PercentageCompleted ?? 0,
    campaignTag: options.campaignTag,
  };
}

export async function getBulkRequestStatus(bulkId: string): Promise<
  | {
      ok: true;
      bulkId: string;
      status: string;
      totalMessages: number;
      releasedCount: number;
      failedCount: number;
      percentageCompleted: number;
    }
  | BulkErrorResult
> {
  let cfg;
  try {
    cfg = getNewsletterPostmarkConfig();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Postmark is not configured",
    };
  }

  const res = await fetch(
    `https://api.postmarkapp.com/email/bulk/${encodeURIComponent(bulkId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Postmark-Server-Token": cfg.token,
      },
    }
  );

  const body = (await res.json().catch(() => ({}))) as {
    Id?: string;
    Status?: string;
    TotalMessages?: number;
    ReleasedCount?: number;
    FailedCount?: number;
    PercentageCompleted?: number;
    ErrorCode?: number;
    Message?: string;
  };

  if (!res.ok) {
    const unavailable = isBulkApiUnavailable(res.status, body);
    return {
      ok: false,
      error: unavailable
        ? "Postmark Broadcast Bulk API is not enabled on this account."
        : body.Message || `Could not fetch bulk status (HTTP ${res.status})`,
      errorCode: body.ErrorCode,
      bulkApiUnavailable: unavailable,
    };
  }

  return {
    ok: true,
    bulkId: body.Id || bulkId,
    status: body.Status || "Unknown",
    totalMessages: body.TotalMessages ?? 0,
    releasedCount: body.ReleasedCount ?? 0,
    failedCount: body.FailedCount ?? 0,
    percentageCompleted: body.PercentageCompleted ?? 0,
  };
}
