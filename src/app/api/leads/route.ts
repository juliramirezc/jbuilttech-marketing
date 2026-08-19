/**
 * Homepage lead capture — server-only.
 * Optional LEAD_WEBHOOK_URL forwards the lead; never logs PII.
 */

export const runtime = "nodejs";

type LeadBody = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
};

function asNonEmptyString(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export async function POST(request: Request): Promise<Response> {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = asNonEmptyString(body.name, 120);
  const company = asNonEmptyString(body.company, 160);
  const email = asNonEmptyString(body.email, 254);
  const phone = asNonEmptyString(body.phone, 40);
  const source = asNonEmptyString(body.source, 80) ?? "homepage";

  if (!name || !company || !email || !phone) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return Response.json({ error: "Invalid phone" }, { status: 400 });
  }

  const payload = {
    name,
    company,
    email,
    phone,
    source,
    received_at: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      const upstream = await fetch(webhook, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!upstream.ok) {
        return Response.json({ error: "Lead delivery failed" }, { status: 502 });
      }
    } catch {
      return Response.json({ error: "Lead delivery failed" }, { status: 502 });
    }
  }

  return Response.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
