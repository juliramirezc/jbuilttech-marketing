"use client";

import { FormEvent, useRef, useState } from "react";
import {
  CALL_AVAILABILITY_OPTIONS,
  GLASS_FABRICATION_AREA_OPTIONS,
  GLASS_FABRICATION_LOCATION_OPTIONS,
  GLASS_FABRICATION_YEARS_WITH_EXPERIENCE,
} from "@/lib/geofenceForms";
import { pushDataLayerEvent } from "@/lib/analytics";
import "../glazier/glazier-application.css";

const BRAND_IMAGE = "/images/dc78-logo.png";
const BRAND_FALLBACK_IMAGE =
  "https://img1.wsimg.com/isteam/ip/3546aeda-652b-4ef2-b76c-731b538bafca/IUPAT%20Website%20Banner-0001.jpg/%3A/";

const FORM_KEY = "glass-fabrication";
const NO_PREVIOUS_EXPERIENCE = "No previous experience";

const CALL_AVAILABILITY_LABELS: Record<string, string> = {
  "Morning (8:00 AM - 11:00 AM)": "Morning — 8:00 AM to 11:00 AM",
  "Midday (11:00 AM - 2:00 PM)": "Midday — 11:00 AM to 2:00 PM",
  "Afternoon (2:00 PM - 5:00 PM)": "Afternoon — 2:00 PM to 5:00 PM",
  "Evening (5:00 PM - 7:00 PM)": "Evening — 5:00 PM to 7:00 PM",
  "Flexible / Any time": "Flexible / Any time",
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __dc78GlassFabricationLeadFired?: boolean;
  }
}

function createSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `glass-fab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Fire Lead once after a successful save — never includes applicant PII. */
function trackSuccessfulApplicationLead() {
  if (typeof window === "undefined") return;
  if (window.__dc78GlassFabricationLeadFired) return;
  window.__dc78GlassFabricationLeadFired = true;

  pushDataLayerEvent("dc78_application_submitted", {
    form_key: FORM_KEY,
    page_path: "/marketingdc78/job/application/glass-fabrication",
  });

  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  } catch {
    // ignore pixel failures
  }
}

export function GlassFabricationApplicationForm() {
  const [logoSrc, setLogoSrc] = useState(BRAND_IMAGE);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredProjectLocation, setPreferredProjectLocation] = useState("");
  const [hasTradeExperience, setHasTradeExperience] = useState<
    "" | "Yes" | "No"
  >("");
  const [areasOfExperience, setAreasOfExperience] = useState<string[]>([]);
  const [otherExperience, setOtherExperience] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [callAvailability, setCallAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  function onLogoError() {
    setLogoSrc((current) =>
      current !== BRAND_FALLBACK_IMAGE ? BRAND_FALLBACK_IMAGE : current
    );
  }

  function onExperienceChange(value: "Yes" | "No") {
    setHasTradeExperience(value);
    if (value === "No") {
      setYearsOfExperience("No experience");
      setAreasOfExperience([NO_PREVIOUS_EXPERIENCE]);
      setOtherExperience("");
      return;
    }
    setYearsOfExperience("");
    setAreasOfExperience((current) =>
      current.filter((area) => area !== NO_PREVIOUS_EXPERIENCE)
    );
  }

  function toggleArea(area: string) {
    if (hasTradeExperience !== "Yes") return;

    if (area === NO_PREVIOUS_EXPERIENCE) {
      setAreasOfExperience([NO_PREVIOUS_EXPERIENCE]);
      setOtherExperience("");
      return;
    }

    setAreasOfExperience((current) => {
      const withoutNone = current.filter(
        (item) => item !== NO_PREVIOUS_EXPERIENCE
      );
      if (withoutNone.includes(area)) {
        const next = withoutNone.filter((item) => item !== area);
        if (area === "Other") setOtherExperience("");
        return next;
      }
      return [...withoutNone, area];
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current || busy) return;
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
      setError("Please select which location you are interested in.");
      return;
    }
    if (!hasTradeExperience) {
      setError(
        "Please tell us whether you have experience working in glass fabrication."
      );
      return;
    }

    const resolvedAreas =
      hasTradeExperience === "No"
        ? [NO_PREVIOUS_EXPERIENCE]
        : areasOfExperience.filter(
            (area) => area !== NO_PREVIOUS_EXPERIENCE
          );

    if (hasTradeExperience === "Yes" && resolvedAreas.length === 0) {
      setError("Please select at least one area of experience.");
      return;
    }

    if (hasTradeExperience === "Yes" && !yearsOfExperience) {
      setError("Please select how many years of experience you have.");
      return;
    }

    if (!callAvailability) {
      setError("Please select your availability for a call.");
      return;
    }

    submittingRef.current = true;
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
          formKey: FORM_KEY,
          submissionId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          preferredProjectLocation,
          customProjectLocation: "",
          hasTradeExperience,
          experienceLength: "",
          areasOfExperience: resolvedAreas,
          otherExperience: resolvedAreas.includes("Other")
            ? otherExperience.trim()
            : "",
          yearsOfExperience:
            hasTradeExperience === "Yes" ? yearsOfExperience : "No experience",
          callAvailability,
          utmMedium,
          trade: "glass-fabrication",
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

      trackSuccessfulApplicationLead();
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setBusy(false);
    }
  }

  const showAreas = hasTradeExperience === "Yes";
  const showOtherDetails = showAreas && areasOfExperience.includes("Other");
  const showYears = hasTradeExperience === "Yes";

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

              <div className="eyebrow">Glass Fabrication Opportunities</div>
              <h1>Glass Fabrication – Employment Opportunities</h1>
              <p className="hero-copy">
                Do you have experience working in glass fabrication? IUPAT
                District Council 78 is looking to connect with skilled glass
                fabrication workers in Tampa, Palmetto, and Oldsmar, Florida.
                Complete the application below, and a representative will
                contact you to discuss available opportunities.
              </p>
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
                        First name <span className="req">*</span>
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
                        Email address <span className="req">*</span>
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
                      Which location are you interested in working in?{" "}
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
                      {GLASS_FABRICATION_LOCATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <span className="field-label">
                      Do you have experience working in glass fabrication?{" "}
                      <span className="req">*</span>
                    </span>
                    <div
                      className="radio-row"
                      role="radiogroup"
                      aria-label="Glass fabrication experience"
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

                  <div className={`field conditional${showAreas ? " show" : ""}`}>
                    <span className="field-label">
                      Which areas of glass fabrication do you have experience
                      in? Select all that apply. <span className="req">*</span>
                    </span>
                    <div
                      className="checkbox-grid"
                      role="group"
                      aria-label="Areas of glass fabrication experience"
                    >
                      {GLASS_FABRICATION_AREA_OPTIONS.filter(
                        (area) => area !== NO_PREVIOUS_EXPERIENCE
                      ).map((area) => (
                        <label key={area} className="checkbox-option">
                          <input
                            type="checkbox"
                            name="areasOfExperience"
                            value={area}
                            checked={areasOfExperience.includes(area)}
                            onChange={() => toggleArea(area)}
                          />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`field conditional${
                      showOtherDetails ? " show" : ""
                    }`}
                  >
                    <label htmlFor="otherExperience">
                      Please describe your other experience (optional)
                    </label>
                    <input
                      id="otherExperience"
                      name="otherExperience"
                      type="text"
                      placeholder="Additional details"
                      value={otherExperience}
                      onChange={(e) => setOtherExperience(e.target.value)}
                    />
                  </div>

                  <div className={`field conditional${showYears ? " show" : ""}`}>
                    <label htmlFor="yearsOfExperience">
                      How many years of experience do you have in glass
                      fabrication? <span className="req">*</span>
                    </label>
                    <select
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      required={hasTradeExperience === "Yes"}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                    >
                      <option value="">Choose one</option>
                      {GLASS_FABRICATION_YEARS_WITH_EXPERIENCE.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="callAvailability">
                      What is the best time for a representative to contact you?{" "}
                      <span className="req">*</span>
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
                      value="Glass Fabrication"
                      readOnly
                      aria-readonly="true"
                    />
                  </div>

                  <input type="hidden" name="source" value="recruitment" />
                  <input
                    type="hidden"
                    name="sheetTab"
                    value="Glass Fabrication"
                  />

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
                    <h3>Thank you for applying!</h3>
                    <p>
                      Your information has been successfully submitted. A
                      representative from IUPAT District Council 78 will contact
                      you to discuss potential glass fabrication opportunities.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </section>
        </section>

        <div className="footer">
          District Council 78 • Glass Fabrication Application
        </div>
      </main>
    </div>
  );
}
