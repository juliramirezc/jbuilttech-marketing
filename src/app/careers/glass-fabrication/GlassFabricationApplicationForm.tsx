"use client";

import { FormEvent, useRef, useState } from "react";
import {
  CALL_AVAILABILITY_OPTIONS,
  GLASS_FABRICATION_DURATION_OPTIONS,
  GLASS_FABRICATION_LOCATION_OPTIONS,
  GLASS_FABRICATION_SPECIALIZATIONS,
  GLASS_FABRICATION_YEARS_WITH_EXPERIENCE,
} from "@/lib/geofenceForms";
import {
  TrackingIsolationGuard,
  recordIsolatedApplicationEvent,
} from "@/components/tracking/TrackingIsolationGuard";
import "./glass-fabrication.css";

const FORM_KEY = "glass-fabrication";
const PAGE_PATH = "/careers/glass-fabrication";
const NO_PREVIOUS_EXPERIENCE = "No previous experience";

const SPECIALIZATION_SET = new Set<string>(GLASS_FABRICATION_SPECIALIZATIONS);

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
  return `glass-fab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function GlassFabricationApplicationForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredProjectLocation, setPreferredProjectLocation] = useState("");
  const [hasTradeExperience, setHasTradeExperience] = useState<
    "" | "Yes" | "No"
  >("");
  const [areasOfExperience, setAreasOfExperience] = useState<string[]>([]);
  const [specializationExperience, setSpecializationExperience] = useState<
    Record<string, string>
  >({});
  const [otherExperience, setOtherExperience] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [callAvailability, setCallAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);
  const eventRecordedRef = useRef(false);

  function onExperienceChange(value: "Yes" | "No") {
    setHasTradeExperience(value);
    if (value === "No") {
      setYearsOfExperience("No experience");
      setAreasOfExperience([NO_PREVIOUS_EXPERIENCE]);
      setSpecializationExperience({});
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
    if (!SPECIALIZATION_SET.has(area)) return;

    const withoutNone = areasOfExperience.filter(
      (item) => item !== NO_PREVIOUS_EXPERIENCE
    );

    if (withoutNone.includes(area)) {
      setSpecializationExperience((prev) => {
        const next = { ...prev };
        delete next[area];
        return next;
      });
      setAreasOfExperience(withoutNone.filter((item) => item !== area));
      return;
    }

    setAreasOfExperience([...withoutNone, area]);
  }

  function setDuration(skill: string, duration: string) {
    setSpecializationExperience((prev) => ({ ...prev, [skill]: duration }));
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
        : areasOfExperience.filter((area) => area !== NO_PREVIOUS_EXPERIENCE);

    if (hasTradeExperience === "Yes" && resolvedAreas.length === 0) {
      setError("Please select at least one area of experience.");
      return;
    }

    const selectedSkills = resolvedAreas.filter((area) =>
      SPECIALIZATION_SET.has(area)
    );
    const missingDuration =
      hasTradeExperience === "Yes"
        ? selectedSkills.find((skill) => !specializationExperience[skill])
        : undefined;
    if (missingDuration) {
      setError(
        `Please select how long you have worked in ${missingDuration}.`
      );
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

    const durations: Record<string, string> = {};
    if (hasTradeExperience === "Yes") {
      for (const skill of selectedSkills) {
        durations[skill] = specializationExperience[skill];
      }
    }

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
          specializationExperience: durations,
          otherExperience:
            hasTradeExperience === "Yes" ? otherExperience.trim() : "",
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

      // Isolated route: local-only event, no shared dataLayer / GTM / Meta pixel.
      if (!eventRecordedRef.current) {
        eventRecordedRef.current = true;
        recordIsolatedApplicationEvent("glass_fabrication_application_submitted", {
          form_key: FORM_KEY,
          page_path: PAGE_PATH,
        });
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setBusy(false);
    }
  }

  const showAreas = hasTradeExperience === "Yes";
  const showYears = hasTradeExperience === "Yes";
  const selectedSkills = GLASS_FABRICATION_SPECIALIZATIONS.filter((skill) =>
    areasOfExperience.includes(skill)
  );

  return (
    <div className="gf-page">
      <TrackingIsolationGuard />
      <main className="page">
        <div className="topbar">
          <div className="brand-line">
            <span className="dot" /> Glass Fabrication Careers
          </div>
          <div className="secure-badge">Application form</div>
        </div>

        <section className="shell">
          <aside className="hero">
            <div>
              <div className="hero-panes" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="eyebrow">Recruitment Application</div>
              <h1>Glass Fabrication Career Opportunities</h1>
              <p className="hero-subtitle">Your Experience Matters.</p>
              <p className="hero-copy">
                We are looking to connect with skilled workers who have
                experience in the glass fabrication industry in Tampa, Palmetto,
                and Oldsmar, Florida.
              </p>
              <p className="hero-copy" style={{ marginTop: "1rem" }}>
                Tell us about your skills and professional experience by
                completing the form below. A recruitment representative will
                contact you to discuss potential opportunities.
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
                      {GLASS_FABRICATION_SPECIALIZATIONS.map((area) => (
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

                    {showAreas && selectedSkills.length > 0 ? (
                      <div className="skill-durations">
                        {selectedSkills.map((skill, index) => {
                          const id = `duration-${index}`;
                          return (
                            <div className="field" key={skill}>
                              <label htmlFor={id}>
                                How long have you worked in {skill}?{" "}
                                <span className="req">*</span>
                              </label>
                              <select
                                id={id}
                                name={`specializationExperience-${skill}`}
                                required
                                value={specializationExperience[skill] || ""}
                                onChange={(e) =>
                                  setDuration(skill, e.target.value)
                                }
                              >
                                <option value="">Choose one</option>
                                {GLASS_FABRICATION_DURATION_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={`field conditional${showAreas ? " show" : ""}`}
                  >
                    <label htmlFor="otherExperience">
                      Additional skills and experience (optional)
                    </label>
                    <textarea
                      id="otherExperience"
                      name="otherExperience"
                      placeholder="Share any additional skills or experience"
                      value={otherExperience}
                      onChange={(e) => setOtherExperience(e.target.value)}
                    />
                  </div>

                  <div className={`field conditional${showYears ? " show" : ""}`}>
                    <label htmlFor="yearsOfExperience">
                      How many total years of experience do you have in glass
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

                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "SUBMITTING..." : "APPLY NOW"}
                  </button>

                  <p className="privacy-note">
                    This application form is operated by JBuiltTech. The
                    information you provide is used only to review your
                    application and to contact you about glass fabrication
                    opportunities.
                  </p>

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
                    <h3>Thank you for submitting your information!</h3>
                    <p>
                      A recruitment representative will contact you to discuss
                      your glass fabrication experience and potential
                      opportunities.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </section>
        </section>

        <div className="footer">Glass Fabrication Application</div>
      </main>
    </div>
  );
}
