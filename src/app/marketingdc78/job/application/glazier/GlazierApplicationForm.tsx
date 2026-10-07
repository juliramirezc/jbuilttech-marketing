"use client";

import { FormEvent, useState } from "react";
import {
  CALL_AVAILABILITY_OPTIONS,
  CITY_AREA_OPTIONS,
  EXPERIENCE_LENGTH_OPTIONS,
} from "@/lib/geofenceForms";
import "./glazier-application.css";

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
  return `glazing-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function GlazierApplicationForm() {
  const [logoSrc, setLogoSrc] = useState(BRAND_IMAGE);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cityArea, setCityArea] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [hasTradeExperience, setHasTradeExperience] = useState<
    "" | "Yes" | "No"
  >("");
  const [experienceLength, setExperienceLength] = useState("");
  const [callAvailability, setCallAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onCityAreaChange(value: string) {
    setCityArea(value);
    if (value !== "Other") setCustomCity("");
  }

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
    if (!cityArea) {
      setError("Please select which area you are located in.");
      return;
    }
    if (cityArea === "Other" && !customCity.trim()) {
      setError("Please enter your city.");
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
          formKey: "glazier-paid-ad",
          submissionId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          cityArea,
          customCity: cityArea === "Other" ? customCity.trim() : "",
          hasTradeExperience,
          experienceLength:
            hasTradeExperience === "Yes" ? experienceLength : "",
          callAvailability,
          utmMedium,
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

              <div className="eyebrow">Glazing Opportunities</div>
              <h1>Apply to Work as a Glazier</h1>
              <p className="hero-copy">
                Complete the application so our team can contact you about the
                opportunity and the next steps.
              </p>

              <div className="pay-card" aria-label="Compensation information">
                <div className="pay-label">Pay + benefits</div>
                <div className="pay-amount">💲 $45.09/hour</div>
                <p className="pay-copy">
                  Including benefits. Details will be explained during the
                  interview. <strong>Do not miss the call.</strong>
                </p>
                <p className="pay-small">
                  An interview is required to review your qualifications to work
                  for Glazing.
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
                    <label htmlFor="cityArea">
                      Which area are you located in?{" "}
                      <span className="req">*</span>
                    </label>
                    <select
                      id="cityArea"
                      name="cityArea"
                      required
                      value={cityArea}
                      onChange={(e) => onCityAreaChange(e.target.value)}
                    >
                      <option value="">Select your area</option>
                      {CITY_AREA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className={`field conditional${
                      cityArea === "Other" ? " show" : ""
                    }`}
                  >
                    <label htmlFor="customCity">
                      Please enter your city <span className="req">*</span>
                    </label>
                    <input
                      id="customCity"
                      name="customCity"
                      type="text"
                      autoComplete="address-level2"
                      required={cityArea === "Other"}
                      placeholder="Your city"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                    />
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
                      value="Glazing"
                      readOnly
                      aria-readonly="true"
                    />
                  </div>

                  <input type="hidden" name="source" value="paid ad" />
                  <input type="hidden" name="sheetTab" value="Glaziers" />

                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "SUBMITTING..." : "APPLY NOW"}
                  </button>

                  {error ? (
                    <div className="status show error" role="status" aria-live="polite">
                      {error}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="success-screen show">
                  <div>
                    <div className="success-icon">✓</div>
                    <h3>Application received.</h3>
                    <p>
                      <strong>
                        Thank you. Our team will contact you using the
                        information you provided.
                      </strong>
                    </p>
                    <span className="small">
                      Please watch for our call during your selected
                      availability window.
                    </span>
                  </div>
                </div>
              )}
            </form>
          </section>
        </section>

        <div className="footer">District Council 78 • Glazing Application</div>
      </main>
    </div>
  );
}
