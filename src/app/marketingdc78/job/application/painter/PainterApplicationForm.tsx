"use client";

import { FormEvent, useState } from "react";
import {
  CALL_AVAILABILITY_OPTIONS,
  EXPERIENCE_LENGTH_OPTIONS,
  PROJECT_LOCATION_OPTIONS,
} from "@/lib/geofenceForms";
import "../glazier/glazier-application.css";

const BRAND_IMAGE = "/images/dc78-logo.png";
const BRAND_FALLBACK_IMAGE =
  "https://img1.wsimg.com/isteam/ip/3546aeda-652b-4ef2-b76c-731b538bafca/IUPAT%20Website%20Banner-0001.jpg/%3A/";

const EXPERIENCE_LENGTH_LABELS: Record<string, string> = {
  "0-3 months": "0–3 months",
  "6 months": "6 months",
  "1 year": "1 year",
  "3 years": "3 years",
  "5 years": "5 years",
  "More than 5 years": "More than 5 years",
};

const CALL_AVAILABILITY_LABELS: Record<string, string> = {
  "Morning (8:00 AM - 11:00 AM)": "Morning — 8:00 AM to 11:00 AM",
  "Midday (11:00 AM - 2:00 PM)": "Midday — 11:00 AM to 2:00 PM",
  "Afternoon (2:00 PM - 5:00 PM)": "Afternoon — 2:00 PM to 5:00 PM",
  "Evening (5:00 PM - 7:00 PM)": "Evening — 5:00 PM to 7:00 PM",
  "Flexible / Any time": "Flexible / Any time",
};

function createSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `painting-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PainterApplicationForm() {
  const [logoSrc, setLogoSrc] = useState(BRAND_IMAGE);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredProjectLocation, setPreferredProjectLocation] = useState("");
  const [hasTradeExperience, setHasTradeExperience] = useState<
    "" | "Yes" | "No"
  >("");
  const [experienceLength, setExperienceLength] = useState("");
  const [callAvailability, setCallAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onExperienceChange(value: "Yes" | "No") {
    setHasTradeExperience(value);
    if (value === "No") setExperienceLength("");
  }

  function onLogoError() {
    setLogoSrc((current) =>
      current !== BRAND_FALLBACK_IMAGE ? BRAND_FALLBACK_IMAGE : current
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email.trim() || !phone.trim()) {
      setError("Please enter your email and phone number.");
      return;
    }
    if (!preferredProjectLocation) {
      setError("Please select your preferred project location.");
      return;
    }
    if (!hasTradeExperience) {
      setError("Please tell us whether you have experience in the trade.");
      return;
    }
    if (hasTradeExperience === "Yes" && !experienceLength) {
      setError("Please select how much experience you have.");
      return;
    }
    if (!callAvailability) {
      setError("Please select your availability for a call.");
      return;
    }

    setBusy(true);
    const submissionId = createSubmissionId();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const utmMedium =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_medium") || ""
        : "";

    try {
      const res = await fetch("/api/geofence-construction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formKey: "painter-industrial",
          submissionId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          preferredProjectLocation,
          hasTradeExperience,
          experienceLength:
            hasTradeExperience === "Yes" ? experienceLength : "",
          callAvailability,
          utmMedium,
          trade: "painting",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Your application could not be submitted. Please try again."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glaz-page">
      <main className="page">
        <div className="topbar">
          <div className="brand-line">
            <span className="dot" /> IUPAT District Council 78
          </div>
          <div className="secure-badge">Application form</div>
        </div>

        <section className="shell">
          <aside className="hero">
            <div>
              <div
                className="logo-stage"
                aria-label="Animated DC 78 brand mark"
              >
                <div className="logo-flip">
                  <div className="logo-face logo-front">
                    <img
                      src={logoSrc}
                      alt="IUPAT District Council 78 brand"
                      onError={onLogoError}
                    />
                  </div>
                  <div className="logo-face logo-back">
                    <div>
                      <div className="dc78-mark">DC 78</div>
                      <div className="dc78-sub">
                        Painters &amp; Allied Trades
                        <br />
                        District Council 78
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="eyebrow">Industrial Painter Opportunities</div>
              <h1>Apply to Work as an Industrial Painter</h1>
              <p className="hero-copy">
                Industrial Painter Journey Worker Opportunities — Tampa &amp;
                Jacksonville, Florida
              </p>

              <div className="pay-card" aria-label="Compensation information">
                <div className="pay-label">Trade</div>
                <div className="pay-amount" style={{ fontSize: "1.15rem" }}>
                  Industrial Painter Journey Worker
                </div>

                <p className="pay-copy" style={{ marginTop: "0.85rem" }}>
                  <strong>Project Locations</strong>
                  <br />
                  Tampa, FL
                  <br />
                  Jacksonville, FL
                </p>

                <p className="pay-small">
                  Workforce Needed: As many qualified candidates as possible.
                </p>

                <div className="pay-label" style={{ marginTop: "1rem" }}>
                  Compensation
                </div>
                <p className="pay-copy">
                  Journey Worker Industrial Painter:
                  <br />
                  <strong>$27.77/hour — On the Check</strong>
                  <br />
                  <strong>$43.45/hour — Total Hourly Package</strong>
                </p>
                <p className="pay-small">
                  Direct hourly pay and the total hourly compensation package
                  are separate figures.
                </p>

                <div className="pay-label" style={{ marginTop: "1rem" }}>
                  Union Benefits
                </div>
                <p className="pay-copy">
                  Family healthcare coverage
                  <br />
                  Pension plan
                  <br />
                  Training and certification courses provided through the union
                </p>

                <div className="pay-label" style={{ marginTop: "1rem" }}>
                  Recruitment Contact
                </div>
                <p className="pay-copy">
                  <strong>Luis Ortega — Council Representative</strong>
                  <br />
                  Phone:{" "}
                  <a href="tel:3216664772" style={{ color: "inherit" }}>
                    321-666-4772
                  </a>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:lortega@dc78.org"
                    style={{ color: "inherit" }}
                  >
                    lortega@dc78.org
                  </a>
                </p>
              </div>
            </div>

            <div className="hero-note">
              Please enter a phone number and call-availability window where you
              can reliably be reached.
            </div>
          </aside>

          <section className="form-card">
            <form onSubmit={(e) => void onSubmit(e)} noValidate>
              {!success ? (
                <div id="formContent">
                  <div className="form-title">
                    <div>
                      <h2>Tell us about you</h2>
                      <p>Fill out the form below, and we will contact you.</p>
                    </div>
                    <div className="required-note">
                      <span className="req">*</span> Required
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor="firstName">
                        Name <span className="req">*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">
                        Last name <span className="req">*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor="email">
                        Email <span className="req">*</span>
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
                    <div className="field">
                      <label htmlFor="phone">
                        Phone number <span className="req">*</span>
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

                  <div className="field">
                    <label htmlFor="preferredProjectLocation">
                      Preferred Project Location{" "}
                      <span className="req">*</span>
                    </label>
                    <select
                      id="preferredProjectLocation"
                      name="preferredProjectLocation"
                      required
                      value={preferredProjectLocation}
                      onChange={(e) =>
                        setPreferredProjectLocation(e.target.value)
                      }
                    >
                      <option value="">Select a location</option>
                      {PROJECT_LOCATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <span className="field-label">
                      Do you have experience on the trade?{" "}
                      <span className="req">*</span>
                    </span>
                    <div
                      className="radio-row"
                      role="radiogroup"
                      aria-label="Trade experience"
                    >
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="hasTradeExperience"
                          value="Yes"
                          checked={hasTradeExperience === "Yes"}
                          onChange={() => onExperienceChange("Yes")}
                          required
                        />
                        <span>Yes</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="hasTradeExperience"
                          value="No"
                          checked={hasTradeExperience === "No"}
                          onChange={() => onExperienceChange("No")}
                          required
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div
                    className={`field conditional${
                      hasTradeExperience === "Yes" ? " show" : ""
                    }`}
                  >
                    <label htmlFor="experienceLength">
                      How much experience do you have?{" "}
                      <span className="req">*</span>
                    </label>
                    <select
                      id="experienceLength"
                      name="experienceLength"
                      required={hasTradeExperience === "Yes"}
                      value={experienceLength}
                      onChange={(e) => setExperienceLength(e.target.value)}
                    >
                      <option value="">Choose one</option>
                      {EXPERIENCE_LENGTH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {EXPERIENCE_LENGTH_LABELS[opt] ?? opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="callAvailability">
                      Availability for a call <span className="req">*</span>
                    </label>
                    <select
                      id="callAvailability"
                      name="callAvailability"
                      required
                      value={callAvailability}
                      onChange={(e) => setCallAvailability(e.target.value)}
                    >
                      <option value="">Choose the best time</option>
                      {CALL_AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {CALL_AVAILABILITY_LABELS[opt] ?? opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="trade">Trade</label>
                    <input
                      id="trade"
                      name="trade"
                      type="text"
                      value="Industrial Painter Journey Worker"
                      readOnly
                      aria-readonly="true"
                    />
                  </div>

                  <input type="hidden" name="source" value="paid ad" />
                  <input type="hidden" name="sheetTab" value="Painting" />

                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "SUBMITTING..." : "APPLY NOW"}
                  </button>

                  {error ? (
                    <div
                      className="status show error"
                      role="status"
                      aria-live="polite"
                    >
                      {error}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="success-screen show">
                  <div>
                    <div className="success-icon">✓</div>
                    <h3>Application Submitted Successfully!</h3>
                    <p>
                      <strong>
                        Thank you for applying for an Industrial Painter Journey
                        Worker opportunity with DC78. Your information has been
                        received.
                      </strong>
                    </p>
                    <span className="small">
                      For recruitment questions, contact Luis Ortega at{" "}
                      <a href="tel:3216664772">321-666-4772</a> or{" "}
                      <a href="mailto:lortega@dc78.org">lortega@dc78.org</a>.
                    </span>
                  </div>
                </div>
              )}
            </form>
          </section>
        </section>

        <div className="footer">
          District Council 78 • Industrial Painter Application
        </div>
      </main>
    </div>
  );
}
