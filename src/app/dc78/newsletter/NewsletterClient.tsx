"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

type Recipient = {
  email: string;
  firstName: string;
  lastName: string;
};

type ParseSummary = {
  totalRows: number;
  validUnique: number;
  invalidCount: number;
  duplicateCount: number;
  emailColumn: string;
  invalidSamples: string[];
};

type PublicConfig = {
  fromEmail: string;
  fromName: string;
  replyTo: string;
  templateAlias: string | null;
  templateId: number | null;
  messageStream: string;
  campaignTagBase: string;
};

type SendResult = {
  bulkId: string;
  status: string;
  totalMessages: number;
  releasedCount: number;
  failedCount: number;
  percentageCompleted: number;
  campaignTag: string;
  postmarkHint?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out.map((c) => c.replace(/^"|"$/g, "").trim());
}

function detectDelimiter(headerLine: string): string {
  const commas = (headerLine.match(/,/g) || []).length;
  const tabs = (headerLine.match(/\t/g) || []).length;
  const semis = (headerLine.match(/;/g) || []).length;
  if (tabs >= commas && tabs >= semis) return "\t";
  if (semis > commas) return ";";
  return ",";
}

function guessEmailColumn(headers: string[], rows: string[][]): number {
  const lower = headers.map((h) => h.toLowerCase());
  const preferred = ["email", "e-mail", "email address", "emailaddress", "mail"];
  for (const name of preferred) {
    const idx = lower.indexOf(name);
    if (idx >= 0) return idx;
  }
  for (let c = 0; c < headers.length; c++) {
    let hits = 0;
    let checked = 0;
    for (const row of rows.slice(0, 30)) {
      const val = (row[c] || "").trim();
      if (!val) continue;
      checked++;
      if (EMAIL_RE.test(val)) hits++;
    }
    if (checked > 0 && hits / checked >= 0.6) return c;
  }
  return 0;
}

function guessNameColumns(headers: string[]): {
  first: number;
  last: number;
  full: number;
} {
  const lower = headers.map((h) => h.toLowerCase());
  const first = lower.findIndex((h) =>
    ["first", "firstname", "first name", "first_name", "given name"].includes(h)
  );
  const last = lower.findIndex((h) =>
    ["last", "lastname", "last name", "last_name", "surname"].includes(h)
  );
  const full = lower.findIndex((h) =>
    ["name", "full name", "fullname", "member name"].includes(h)
  );
  return {
    first: first >= 0 ? first : -1,
    last: last >= 0 ? last : -1,
    full: full >= 0 ? full : -1,
  };
}

function parseCsv(text: string): {
  recipients: Recipient[];
  summary: ParseSummary;
} {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      recipients: [],
      summary: {
        totalRows: 0,
        validUnique: 0,
        invalidCount: 0,
        duplicateCount: 0,
        emailColumn: "(none)",
        invalidSamples: ["CSV needs a header row and at least one data row"],
      },
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter);
  const dataRows = lines.slice(1).map((l) => splitCsvLine(l, delimiter));
  const emailIdx = guessEmailColumn(headers, dataRows);
  const nameCols = guessNameColumns(headers);

  const seen = new Set<string>();
  const recipients: Recipient[] = [];
  let invalidCount = 0;
  let duplicateCount = 0;
  const invalidSamples: string[] = [];

  for (const row of dataRows) {
    const rawEmail = (row[emailIdx] || "").trim();
    const email = rawEmail.toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.includes(",")) {
      invalidCount++;
      if (invalidSamples.length < 8) {
        invalidSamples.push(rawEmail || "(blank email)");
      }
      continue;
    }
    if (seen.has(email)) {
      duplicateCount++;
      continue;
    }
    seen.add(email);

    let firstName = nameCols.first >= 0 ? row[nameCols.first] || "" : "";
    let lastName = nameCols.last >= 0 ? row[nameCols.last] || "" : "";
    if (!firstName && !lastName && nameCols.full >= 0) {
      const parts = (row[nameCols.full] || "").trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ");
    }

    recipients.push({
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  }

  return {
    recipients,
    summary: {
      totalRows: dataRows.length,
      validUnique: recipients.length,
      invalidCount,
      duplicateCount,
      emailColumn: headers[emailIdx] || `column ${emailIdx + 1}`,
      invalidSamples,
    },
  };
}

export function NewsletterClient() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState("");
  const [testFirst, setTestFirst] = useState("");
  const [testLast, setTestLast] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/newsletter/session");
    if (!res.ok) {
      setAuthenticated(false);
      setChecking(false);
      return;
    }
    const data = await res.json();
    setAuthenticated(true);
    setAdminEmail(data.email || "");
    setConfig(data.config || null);
    setConfigError(data.configError || null);
    if (!testEmail && data.email) setTestEmail(data.email);
    setChecking(false);
  }, [testEmail]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      const res = await fetch("/api/newsletter/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }
      setLoginPassword("");
      await refreshSession();
    } finally {
      setLoginBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/newsletter/logout", { method: "POST" });
    setAuthenticated(false);
    setRecipients([]);
    setSummary(null);
    setFileName(null);
    setSendResult(null);
    setStatus(null);
  }

  function onFile(file: File | null) {
    setParseError(null);
    setSendResult(null);
    setStatus(null);
    setConfirmText("");
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setParseError("Please upload a .csv (Excel → Save As CSV).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const parsed = parseCsv(text);
        setRecipients(parsed.recipients);
        setSummary(parsed.summary);
        setFileName(file.name);
        // File contents stay in browser memory only — never uploaded until send.
      } catch {
        setParseError("Could not parse that CSV.");
      }
    };
    reader.readAsText(file);
  }

  const confirmReady = useMemo(() => {
    if (!summary || summary.validUnique < 1) return false;
    return confirmText.trim() === String(summary.validUnique);
  }, [confirmText, summary]);

  async function sendTest() {
    setBusy(true);
    setStatus(null);
    setSendResult(null);
    try {
      const email = testEmail.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        setStatus("Enter a valid test email address.");
        return;
      }
      const res = await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [
            {
              email,
              firstName: testFirst.trim(),
              lastName: testLast.trim(),
            },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(
          data.bulkApiUnavailable
            ? data.error
            : data.error || `Test send failed (HTTP ${res.status})`
        );
        return;
      }
      setSendResult(data as SendResult);
      setStatus(
        `Test accepted by Postmark Bulk API. Bulk Id: ${data.bulkId}. Released so far: ${data.releasedCount}. Failed so far: ${data.failedCount}.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendAll() {
    if (!summary || !confirmReady) return;
    setBusy(true);
    setStatus(null);
    setSendResult(null);
    try {
      const res = await fetch("/api/newsletter/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          confirmCount: summary.validUnique,
          confirmSend: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(
          data.bulkApiUnavailable
            ? data.error
            : data.error || `Full send failed (HTTP ${res.status})`
        );
        return;
      }
      setSendResult(data as SendResult);
      setStatus(
        `Full send accepted by Postmark Bulk API for ${data.totalMessages} messages. Bulk Id: ${data.bulkId}. Released: ${data.releasedCount}. Failed (incl. suppressions): ${data.failedCount}.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function refreshBulkStatus() {
    if (!sendResult?.bulkId) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/newsletter/bulk-status?id=${encodeURIComponent(sendResult.bulkId)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Could not refresh bulk status");
        return;
      }
      setSendResult((prev) =>
        prev
          ? {
              ...prev,
              status: data.status,
              totalMessages: data.totalMessages,
              releasedCount: data.releasedCount,
              failedCount: data.failedCount,
              percentageCompleted: data.percentageCompleted,
            }
          : prev
      );
      setStatus(
        `Bulk ${data.bulkId}: ${data.status} — released ${data.releasedCount}, failed ${data.failedCount} (${data.percentageCompleted}% processed).`
      );
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <p>Checking session…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>DC 78 newsletter</h1>
          <p style={styles.muted}>Password-protected distribution console</p>
          <form onSubmit={(e) => void onLogin(e)} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </label>
            <label style={styles.label}>
              Password
              <input
                style={styles.input}
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </label>
            {loginError ? <p style={styles.error}>{loginError}</p> : null}
            <button style={styles.button} type="submit" disabled={loginBusy}>
              {loginBusy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.cardWide}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.h1}>DC 78 newsletter</h1>
            <p style={styles.muted}>Signed in as {adminEmail}</p>
          </div>
          <button style={styles.secondaryBtn} type="button" onClick={() => void onLogout()}>
            Sign out
          </button>
        </div>

        {configError ? (
          <p style={styles.error}>Postmark config: {configError}</p>
        ) : config ? (
          <div style={styles.metaBox}>
            <div>
              From: <strong>{config.fromName}</strong> &lt;{config.fromEmail}&gt;
            </div>
            <div>
              Stream: <strong>{config.messageStream}</strong>
            </div>
            <div>
              Template:{" "}
              <strong>
                {config.templateAlias || `ID ${config.templateId}`}
              </strong>
            </div>
            <div>Opens: TrackOpens enabled · Unsub: Postmark Broadcast</div>
          </div>
        ) : null}

        <section style={styles.section}>
          <h2 style={styles.h2}>1. Upload CSV (session only)</h2>
          <p style={styles.muted}>
            Excel → Save As CSV. The list stays in this browser session until you
            send. It is not saved to GitHub, disk, or a public URL.
          </p>
          <input
            type="file"
            accept=".csv,text/csv,.txt"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          {fileName ? (
            <p style={styles.muted}>Loaded file: {fileName}</p>
          ) : null}
          {parseError ? <p style={styles.error}>{parseError}</p> : null}
          {summary ? (
            <div style={styles.metaBox}>
              <div>
                Email column: <strong>{summary.emailColumn}</strong>
              </div>
              <div>
                Data rows: <strong>{summary.totalRows}</strong>
              </div>
              <div>
                Valid unique recipients:{" "}
                <strong>{summary.validUnique}</strong>
              </div>
              <div>
                Duplicates removed: <strong>{summary.duplicateCount}</strong>
              </div>
              <div>
                Invalid rows: <strong>{summary.invalidCount}</strong>
              </div>
              {summary.invalidSamples.length > 0 ? (
                <div style={styles.muted}>
                  Invalid samples: {summary.invalidSamples.join(", ")}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>2. Send test to myself</h2>
          <div style={styles.grid}>
            <label style={styles.label}>
              Test email
              <input
                style={styles.input}
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </label>
            <label style={styles.label}>
              First name
              <input
                style={styles.input}
                value={testFirst}
                onChange={(e) => setTestFirst(e.target.value)}
              />
            </label>
            <label style={styles.label}>
              Last name
              <input
                style={styles.input}
                value={testLast}
                onChange={(e) => setTestLast(e.target.value)}
              />
            </label>
          </div>
          <button
            style={styles.button}
            type="button"
            disabled={busy}
            onClick={() => void sendTest()}
          >
            Send test to myself
          </button>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>3. Send to all</h2>
          <p style={styles.muted}>
            Uses Postmark Broadcast Bulk API only. If Bulk access is not approved
            on your account, you will see a clear error — this page will not
            silently switch to another send method.
          </p>
          <label style={styles.label}>
            Type the recipient count ({summary?.validUnique ?? 0}) to confirm
            <input
              style={styles.input}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={summary ? String(summary.validUnique) : "0"}
              disabled={!summary || summary.validUnique < 1}
            />
          </label>
          <button
            style={{
              ...styles.button,
              background: confirmReady ? "#8a1c1c" : "#999",
            }}
            type="button"
            disabled={busy || !confirmReady}
            onClick={() => void sendAll()}
          >
            Send to all ({summary?.validUnique ?? 0})
          </button>
        </section>

        {status ? <p style={styles.status}>{status}</p> : null}

        {sendResult ? (
          <div style={styles.metaBox}>
            <div>
              Bulk Id: <strong>{sendResult.bulkId}</strong>
            </div>
            <div>
              Status: <strong>{sendResult.status}</strong>
            </div>
            <div>
              Accepted / total messages:{" "}
              <strong>{sendResult.totalMessages}</strong>
            </div>
            <div>
              Released: <strong>{sendResult.releasedCount}</strong>
            </div>
            <div>
              Failed (includes suppressions):{" "}
              <strong>{sendResult.failedCount}</strong>
            </div>
            <div>
              Processed: <strong>{sendResult.percentageCompleted}%</strong>
            </div>
            <div>
              Campaign tag: <strong>{sendResult.campaignTag}</strong>
            </div>
            <button
              style={styles.secondaryBtn}
              type="button"
              disabled={busy}
              onClick={() => void refreshBulkStatus()}
            >
              Refresh Postmark status
            </button>
            <p style={styles.muted}>
              {sendResult.postmarkHint ||
                "Review results in Postmark → Message Streams → public-sector-newsletter → Activity / Bulk."}
            </p>
            <p style={styles.muted}>
              Open tracking can miss reads when images are blocked. Do not treat
              a missing open as proof someone did not read the email.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f1ea",
    padding: "32px 16px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#1a1a1a",
  },
  card: {
    maxWidth: 420,
    margin: "40px auto",
    background: "#fff",
    border: "1px solid #ddd",
    padding: 28,
  },
  cardWide: {
    maxWidth: 820,
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #ddd",
    padding: 28,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  h1: { margin: "0 0 8px", fontSize: 28 },
  h2: { margin: "0 0 10px", fontSize: 20 },
  muted: { color: "#555", fontSize: 14, margin: "6px 0" },
  form: { display: "grid", gap: 12, marginTop: 16 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
  },
  button: {
    marginTop: 8,
    padding: "12px 16px",
    background: "#111",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
  },
  secondaryBtn: {
    padding: "8px 12px",
    background: "#eee",
    border: "1px solid #ccc",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
  },
  error: { color: "#8a1c1c", fontSize: 14 },
  status: {
    marginTop: 16,
    padding: 12,
    background: "#f7f7f7",
    border: "1px solid #ddd",
    fontFamily: "system-ui, sans-serif",
    fontSize: 14,
  },
  section: { marginTop: 28 },
  metaBox: {
    marginTop: 12,
    padding: 12,
    background: "#faf8f4",
    border: "1px solid #e5e0d6",
    display: "grid",
    gap: 6,
    fontFamily: "system-ui, sans-serif",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 8,
  },
};
