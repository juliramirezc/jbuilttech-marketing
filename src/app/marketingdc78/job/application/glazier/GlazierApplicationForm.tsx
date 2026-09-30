"use client";

import { FormEvent, useState } from "react";
import {
  CALL_AVAILABILITY_OPTIONS,
  EXPERIENCE_LENGTH_OPTIONS,
} from "@/lib/geofenceForms";
import "./glazier-application.css";

function createSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `glazier-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function GlazierApplicationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

    try {
      const res = await fetch("/api/geofence-construction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formKey: "glazier-paid-ad",
          submissionId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          hasTradeExperience,
          experienceLength:
            hasTradeExperience === "Yes" ? experienceLength : "",
          callAvailability,
          // Client may include these; server forces authoritative values
          trade: "Glazing",
          sheetTab: "Glaziers",
          source: "paid ad",
          formType: "geofence-construction",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "We could not submit your application. Please try again."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("We could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="glaz-page">
      <div className="glaz-inner">
        <div className="glaz-brand">
          <span className="dot" /> District Council 78 · Glazing careers
        </div>

        <section className="glaz-card">
          {success ? (
            <div className="glaz-success">
              <div className="glaz-success-icon">✓</div>
              <h2>Application received</h2>
              <p>
                Thank you for applying. Our team will review your information and
                contact you about next steps. Please answer if we call — the
                interview is when compensation and benefits are explained in
                detail.
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} noValidate>
              <div className="glaz-eyebrow">Now hiring</div>
              <h1>Apply to Work for Glazing!</h1>
              <div className="glaz-pay">$45.09/hour including benefits</div>
              <p className="glaz-lead">
                Compensation and benefit details will be explained during the
                interview. Do not miss the call.
              </p>
              <p className="glaz-note">
                An interview is required to review your qualifications for this
                glazing opportunity.
              </p>

              <div className="glaz-grid-2">
                <div className="glaz-field">
                  <label htmlFor="firstName">
                    First Name <span className="glaz-req">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="glaz-field">
                  <label htmlFor="lastName">
                    Last Name <span className="glaz-req">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="glaz-grid-2">
                <div className="glaz-field">
                  <label htmlFor="email">
                    Email <span className="glaz-req">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="glaz-field">
                  <label htmlFor="phone">
                    Phone Number <span className="glaz-req">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="glaz-field">
                <label htmlFor="trade">Trade</label>
                <input
                  id="trade"
                  name="trade"
                  type="text"
                  value="Glazing"
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div className="glaz-field">
                <span className="glaz-label">
                  Do you have experience in the trade?{" "}
                  <span className="glaz-req">*</span>
                </span>
                <div className="glaz-radio-group" role="radiogroup">
                  <label className="glaz-radio">
                    <input
                      type="radio"
                      name="hasTradeExperience"
                      value="Yes"
                      checked={hasTradeExperience === "Yes"}
                      onChange={() => onExperienceChange("Yes")}
                    />
                    Yes
                  </label>
                  <label className="glaz-radio">
                    <input
                      type="radio"
                      name="hasTradeExperience"
                      value="No"
                      checked={hasTradeExperience === "No"}
                      onChange={() => onExperienceChange("No")}
                    />
                    No
                  </label>
                </div>
              </div>

              {hasTradeExperience === "Yes" ? (
                <div className="glaz-field">
                  <label htmlFor="experienceLength">
                    How much experience do you have?{" "}
                    <span className="glaz-req">*</span>
                  </label>
                  <select
                    id="experienceLength"
                    name="experienceLength"
                    required
                    value={experienceLength}
                    onChange={(e) => setExperienceLength(e.target.value)}
                  >
                    <option value="">Select experience</option>
                    {EXPERIENCE_LENGTH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="glaz-field">
                <label htmlFor="callAvailability">
                  Availability for a call <span className="glaz-req">*</span>
                </label>
                <select
                  id="callAvailability"
                  name="callAvailability"
                  required
                  value={callAvailability}
                  onChange={(e) => setCallAvailability(e.target.value)}
                >
                  <option value="">Select availability</option>
                  {CALL_AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <button className="glaz-submit" type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit application"}
              </button>

              {error ? (
                <div className="glaz-error" role="alert">
                  {error}
                </div>
              ) : null}
            </form>
          )}
        </section>

        <div className="glaz-footer">
          District Council 78 · Glazing job application
        </div>
      </div>
    </main>
  );
}
