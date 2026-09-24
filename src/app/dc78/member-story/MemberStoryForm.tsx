"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./member-story.css";

const BRAND_IMAGE = "/images/dc78-logo.png";
const BRAND_FALLBACK =
  "https://img1.wsimg.com/isteam/ip/3546aeda-652b-4ef2-b76c-731b538bafca/IUPAT%20Website%20Banner-0001.jpg/%3A/";
const TARGET_FOLDER_NAME = "Member-newsletter-stories";
const CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 20;

const allowedByExtension =
  /\.(heic|heif|jpg|jpeg|png|gif|webp|mov|mp4|m4v|webm|3gp)$/i;

type UploadedMedia = {
  driveFileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

function isAcceptedMedia(file: File) {
  const type = (file.type || "").toLowerCase();
  return (
    type.startsWith("image/") ||
    type.startsWith("video/") ||
    allowedByExtension.test(file.name || "")
  );
}

function normalizeMime(file: File) {
  if (file.type) return file.type;
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".heif")) return "image/heif";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".3gp")) return "video/3gpp";
  if (/\.(jpg|jpeg)$/i.test(name)) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function createSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type FileThumbProps = { file: File };

function FileThumb({ file }: FileThumbProps) {
  const type = normalizeMime(file);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(type.startsWith("image/") && !/heic|heif/i.test(type))) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, type]);

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" />;
  }
  return <>{type.startsWith("video/") ? "▶" : "▧"}</>;
}

export function MemberStoryForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [story, setStory] = useState("");
  const [consent, setConsent] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Preparing upload…");
  const [showProgress, setShowProgress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoSrc, setLogoSrc] = useState(BRAND_IMAGE);
  const [logoFlipped, setLogoFlipped] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);

  const formData = useMemo(
    () => ({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
      email: email.trim(),
      phone: phone.trim(),
      story: story.trim(),
    }),
    [firstName, lastName, email, phone, story]
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).filter(isAcceptedMedia);
    setSelectedFiles((prev) => {
      const keys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const next = [...prev];
      for (const file of incoming) {
        if (next.length >= MAX_FILES) break;
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!keys.has(key)) {
          next.push(file);
          keys.add(key);
        }
      }
      return next;
    });
  }, []);

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProgress(percent: number, text?: string) {
    setShowProgress(true);
    setProgress(Math.max(0, Math.min(100, Math.round(percent))));
    if (text) setProgressText(text);
  }

  async function initUpload(file: File, submissionId: string) {
    const response = await fetch("/api/uploads/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        fileName: file.name,
        fileSize: file.size,
        mimeType: normalizeMime(file),
        folderName: TARGET_FOLDER_NAME,
        formType: "member-newsletter-story",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        story: formData.story,
        submissionId,
      }),
    });
    if (!response.ok) throw new Error(`Could not start upload for ${file.name}.`);
    const data = await response.json();
    if (!data.success || !data.uploadUrl || !data.uploadId) {
      throw new Error(`Upload session was not created for ${file.name}.`);
    }
    return data as { uploadUrl: string; uploadId: string };
  }

  async function uploadFileInChunks(
    file: File,
    uploadUrl: string,
    onProgress: (p: number) => void
  ) {
    let start = 0;
    let driveFileId: string | null = null;
    const mimeType = normalizeMime(file);

    while (start < file.size) {
      const endExclusive = Math.min(start + CHUNK_SIZE, file.size);
      const endInclusive = endExclusive - 1;
      const chunk = file.slice(start, endExclusive);

      const response = await fetch("/api/uploads/chunk", {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "Content-Range": `bytes ${start}-${endInclusive}/${file.size}`,
          "X-Upload-Url": uploadUrl,
        },
        body: chunk,
      });

      if (response.status === 308) {
        start = endExclusive;
        onProgress(start / file.size);
        continue;
      }

      if (!response.ok) {
        let detail = "";
        try {
          detail = await response.text();
        } catch {
          /* ignore */
        }
        throw new Error(
          `Upload failed for ${file.name}${detail ? `: ${detail}` : "."}`
        );
      }

      const data = await response.json();
      driveFileId = (data.id || data.driveFileId || null) as string | null;
      start = endExclusive;
      onProgress(1);
    }

    if (!driveFileId) {
      throw new Error(`Drive did not return a file ID for ${file.name}.`);
    }
    return driveFileId;
  }

  async function completeUpload(
    file: File,
    uploadId: string,
    driveFileId: string,
    submissionId: string
  ) {
    const response = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        name: formData.fullName,
        email: formData.email,
        fileName: file.name,
        fileSize: file.size,
        mimeType: normalizeMime(file),
        driveFileId,
        folderName: TARGET_FOLDER_NAME,
        formType: "member-newsletter-story",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        story: formData.story,
        submissionId,
      }),
    });
    if (!response.ok) throw new Error(`Could not finalize ${file.name}.`);
  }

  async function submitStoryRecord(
    submissionId: string,
    uploadedFiles: UploadedMedia[]
  ) {
    const response = await fetch("/api/member-stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        submissionId,
        media: uploadedFiles,
        folderName: TARGET_FOLDER_NAME,
        formType: "member-newsletter-story",
      }),
    });
    if (!response.ok) {
      throw new Error("Your story could not be saved. Please try again.");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!formData.email || !formData.phone || !consent) {
      setStatus("Please enter your required email, phone number, and consent.");
      return;
    }

    if (submittedRef.current) return;

    setBusy(true);
    const submissionId = createSubmissionId();

    try {
      const uploadedFiles: UploadedMedia[] = [];

      if (selectedFiles.length > 0) {
        let completedFiles = 0;
        const totalFiles = selectedFiles.length;

        for (const file of selectedFiles) {
          updateProgress(
            (completedFiles / totalFiles) * 92,
            `Preparing ${file.name}…`
          );
          const init = await initUpload(file, submissionId);
          const driveFileId = await uploadFileInChunks(
            file,
            init.uploadUrl,
            (fileProgress) => {
              const overall =
                ((completedFiles + fileProgress) / totalFiles) * 92;
              updateProgress(overall, `Uploading ${file.name}…`);
            }
          );
          await completeUpload(file, init.uploadId, driveFileId, submissionId);
          uploadedFiles.push({
            driveFileId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: normalizeMime(file),
          });
          completedFiles += 1;
          updateProgress(
            (completedFiles / totalFiles) * 92,
            `Uploaded ${completedFiles} of ${totalFiles}`
          );
        }
      } else {
        updateProgress(25, "Saving your story…");
      }

      updateProgress(96, "Recording your submission…");
      await submitStoryRecord(submissionId, uploadedFiles);
      updateProgress(100, "Submission complete");
      submittedRef.current = true;
      setSuccess(true);
      setTimeout(() => {
        successRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 280);
    } catch (err) {
      console.error(err);
      setStatus(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting. Please try again."
      );
      setProgressText("Upload paused");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dc78-page">
      <div className="dc78-inner">
        <div className="dc78-topbar">
          <div className="dc78-brand-line">
            <span className="dot" /> IUPAT District Council 78
          </div>
          <div className="dc78-secure-badge">🔒 Member story submission</div>
        </div>

        <section className="dc78-shell">
          <aside className="dc78-hero">
            <div>
              <div
                className="dc78-logo-stage"
                aria-label="Animated DC 78 brand mark"
              >
                <div
                  className={`dc78-logo-flip${logoFlipped ? " is-flipped" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={logoFlipped}
                  aria-label="Flip DC 78 logo"
                  onClick={() => setLogoFlipped((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLogoFlipped((v) => !v);
                    }
                  }}
                >
                  <div className="dc78-logo-face dc78-logo-front">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoSrc}
                      alt="IUPAT District Council 78 brand"
                      onError={() => {
                        if (logoSrc !== BRAND_FALLBACK) setLogoSrc(BRAND_FALLBACK);
                      }}
                    />
                  </div>
                  <div className="dc78-logo-face dc78-logo-back">
                    <div className="dc78-mark">DC 78</div>
                    <div className="dc78-sub">
                      Painters & Allied Trades
                      <br />
                      District Council 78
                    </div>
                  </div>
                </div>
              </div>

              <div className="dc78-eyebrow">Member Newsletter Stories</div>
              <h1>Share your story!</h1>
              <p className="dc78-hero-copy">
                Your experience matters. Tell us about your work, your union
                experience, a moment you are proud of, or a story you believe
                fellow members should hear.
              </p>
            </div>

            <div className="dc78-hero-note">
              You can submit directly from an iPhone, iPad, Android phone,
              tablet, or computer. Photos and videos can be selected from your
              camera roll or dragged into the upload area.
            </div>
          </aside>

          <section className="dc78-form-card">
            <form onSubmit={(e) => void onSubmit(e)} noValidate>
              {!success ? (
                <div>
                  <div className="dc78-form-title">
                    <div>
                      <h2>Tell us about you</h2>
                      <p>
                        Fill out the form below and add any photos or videos
                        that help tell your story.
                      </p>
                    </div>
                    <div className="dc78-required-note">
                      <span className="dc78-req">*</span> Required
                    </div>
                  </div>

                  <div className="dc78-grid-2">
                    <div className="dc78-field">
                      <label htmlFor="firstName">Name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="dc78-field">
                      <label htmlFor="lastName">Last name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="dc78-grid-2">
                    <div className="dc78-field">
                      <label htmlFor="email">
                        Email <span className="dc78-req">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="dc78-field">
                      <label htmlFor="phone">
                        Phone number to contact{" "}
                        <span className="dc78-req">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        required
                        placeholder="(555) 555-5555"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="dc78-field">
                    <label htmlFor="story">Your story</label>
                    <textarea
                      id="story"
                      name="story"
                      placeholder="Tell us what happened, why it matters to you, and anything you would like members to know..."
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                    />
                  </div>

                  <div className="dc78-field">
                    <span className="dc78-label">Photos or videos</span>
                    <label
                      className={`dc78-drop-zone${dragOver ? " dragover" : ""}`}
                      htmlFor="mediaInput"
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        addFiles(e.dataTransfer.files);
                      }}
                    >
                      <div className="dc78-upload-icon">⇧</div>
                      <strong>Drop photos or videos here</strong>
                      <p>
                        or tap to choose from your device
                        <br />
                        Supports iPhone HEIC/HEIF, MOV and common Android
                        photo/video formats.
                      </p>
                      <input
                        id="mediaInput"
                        className="dc78-file-input"
                        type="file"
                        multiple
                        accept="image/*,video/*,.heic,.heif,.mov,.mp4,.m4v,.webm,.3gp,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files) addFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <div className="dc78-file-list">
                      {selectedFiles.map((file, index) => (
                        <div className="dc78-file-row" key={`${file.name}-${index}`}>
                          <div className="dc78-file-thumb">
                            <FileThumb file={file} />
                          </div>
                          <div>
                            <div className="dc78-file-name">{file.name}</div>
                            <div className="dc78-file-meta">
                              {formatBytes(file.size)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="dc78-remove-btn"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`dc78-progress-wrap${showProgress ? " active" : ""}`}
                    aria-live="polite"
                  >
                    <div className="dc78-progress-head">
                      <span>{progressText}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="dc78-progress-track">
                      <div
                        className="dc78-progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <label className="dc78-consent">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      I understand that submitting this form allows the DC 78
                      communications team to contact me about my story and the
                      media I provide.
                    </span>
                  </label>

                  <button
                    className="dc78-submit-btn"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "Submitting…" : "SUBMIT"}
                  </button>
                  {status ? (
                    <div className="dc78-status show error" role="status">
                      {status}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="dc78-success-screen show"
                  id="successScreen"
                  ref={successRef}
                >
                  <div>
                    <div className="dc78-success-icon">✓</div>
                    <h3>Thank you for sharing.</h3>
                    <p>
                      <strong>
                        You will be contacted by Juliana Ramirez from JBuilttech
                        to coordinate how the story is being told.
                      </strong>
                    </p>
                    <span className="small">Your submission has been received.</span>
                  </div>
                </div>
              )}
            </form>
          </section>
        </section>

        <div className="dc78-footer">
          District Council 78 • Member Newsletter Story Submission
        </div>
      </div>
    </main>
  );
}
