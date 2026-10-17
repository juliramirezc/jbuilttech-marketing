"use client";

import { FormEvent, useState } from "react";
import type { BuildingUnionPowerClassConfig } from "@/lib/buildingUnionPower/classes";
import { buildGoogleCalendarUrl } from "@/lib/buildingUnionPower/classes";
import {
  isValidUsPhone,
  REMINDER_CONSENT_OPTIONS,
  STEWARD_OFFICER_OPTIONS,
  UNION_MEMBER_OPTIONS,
} from "@/lib/buildingUnionPower/schema";
import "./building-union-power-registration.css";

const BRAND_IMAGE = "/images/dc78-logo.png";
const BRAND_FALLBACK_IMAGE =
  "https://img1.wsimg.com/isteam/ip/3546aeda-652b-4ef2-b76c-731b538bafca/IUPAT%20Website%20Banner-0001.jpg/%3A/";

type Props = {
  classConfig: BuildingUnionPowerClassConfig;
  apiPath: string;
};

type FormState = {
  fullName: string;
  cellphone: string;
  email: string;
  employer: string;
  workLocation: string;
  jobTitle: string;
  unionMember: "" | (typeof UNION_MEMBER_OPTIONS)[number];
  stewardOrOfficer: "" | (typeof STEWARD_OFFICER_OPTIONS)[number];
  learnGoals: string;
  accommodations: string;
  reminderConsent: "" | (typeof REMINDER_CONSENT_OPTIONS)[number];
};

const INITIAL: FormState = {
  fullName: "",
  cellphone: "",
  email: "",
  employer: "",
  workLocation: "",
  jobTitle: "",
  unionMember: "",
  stewardOrOfficer: "",
  learnGoals: "",
  accommodations: "",
  reminderConsent: "",
};

function validateClient(form: FormState): string | null {
  if (!form.fullName.trim()) return "Please enter your full name.";
  if (!form.cellphone.trim() || !isValidUsPhone(form.cellphone)) {
    return "Please enter a valid US cellphone number.";
  }
  const email = form.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address, or leave it blank.";
  }
  if (!form.employer.trim()) return "Please enter your employer / school district.";
  if (!form.workLocation.trim()) {
    return "Please enter your school or work location.";
  }
  if (!form.jobTitle.trim()) return "Please enter your job title.";
  if (!form.unionMember) return "Please tell us if you are a union member.";
  if (!form.stewardOrOfficer) {
    return "Please tell us if you are a union steward or officer.";
  }
  if (!form.reminderConsent) {
    return "Please tell us whether we may text or email you reminders.";
  }
  return null;
}

export function BuildingUnionPowerRegistrationForm({
  classConfig,
  apiPath,
}: Props) {
  const [logoSrc, setLogoSrc] = useState(BRAND_IMAGE);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calendarUrl = buildGoogleCalendarUrl(classConfig);
  const countyLabel = classConfig.subtitle.replace(" — Class Registration", "");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onLogoError() {
    setLogoSrc((current) =>
      current !== BRAND_FALLBACK_IMAGE ? BRAND_FALLBACK_IMAGE : current
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const clientError = validateClient(form);
    if (clientError) {
      setError(clientError);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          cellphone: form.cellphone.trim(),
          email: form.email.trim(),
          employer: form.employer.trim(),
          workLocation: form.workLocation.trim(),
          jobTitle: form.jobTitle.trim(),
          unionMember: form.unionMember,
          stewardOrOfficer: form.stewardOrOfficer,
          learnGoals: form.learnGoals.trim(),
          accommodations: form.accommodations.trim(),
          reminderConsent: form.reminderConsent,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Your registration could not be submitted. Please try again."
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
    <div className="bup-page">
      <div className="bup-inner">
        <div className="bup-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="IUPAT District Council 78" onError={onLogoError} />
          <span className="bup-brand-text">IUPAT District Council 78</span>
        </div>

        <section className="bup-hero-card" aria-label="Class information">
          <div className="bup-eyebrow">Public Sector Training</div>
          <h1>{classConfig.title}</h1>
          <p className="bup-subtitle">{classConfig.subtitle}</p>
          <dl className="bup-meta">
            <div className="bup-meta-row">
              <dt>Date</dt>
              <dd>{classConfig.dateLabel}</dd>
            </div>
            <div className="bup-meta-row">
              <dt>Time</dt>
              <dd>{classConfig.timeLabel}</dd>
            </div>
            {classConfig.locationName.trim() ? (
              <div className="bup-meta-row">
                <dt>Location</dt>
                <dd>{classConfig.locationName}</dd>
              </div>
            ) : null}
            <div className="bup-meta-row">
              <dt>Address</dt>
              <dd>
                {classConfig.addressLine1}
                <br />
                {classConfig.addressLine2}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bup-form-card">
          {success ? (
            <div className="bup-success" role="status">
              <div className="bup-success-icon" aria-hidden="true">
                ✓
              </div>
              <h2>You&apos;re registered!</h2>
              <p className="bup-success-class">
                {classConfig.title} — {countyLabel}
              </p>
              <p className="bup-success-details">
                {classConfig.dateLabel}
                <br />
                {classConfig.timeLabel}
                <br />
                {classConfig.locationName.trim() ? (
                  <>
                    {classConfig.locationName}
                    <br />
                  </>
                ) : null}
                {classConfig.addressLine1}
                <br />
                {classConfig.addressLine2}
              </p>
              <p className="bup-success-note">
                We look forward to seeing you at the Building Union Power 2 class!
              </p>
              <a
                className="bup-calendar"
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Calendar
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="bup-form-head">
                <div>
                  <h2>Class Registration</h2>
                  <p>Complete the form below to reserve your seat.</p>
                </div>
                <div className="bup-required-note">
                  <span className="bup-req">*</span> Required
                </div>
              </div>

              <div className="bup-grid-2">
                <div className="bup-field">
                  <label htmlFor="bup-fullName">
                    Full name <span className="bup-req">*</span>
                  </label>
                  <input
                    id="bup-fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="bup-field">
                  <label htmlFor="bup-cellphone">
                    Cellphone number <span className="bup-req">*</span>
                  </label>
                  <input
                    id="bup-cellphone"
                    name="cellphone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    placeholder="(954) 555-1234"
                    value={form.cellphone}
                    onChange={(e) => update("cellphone", e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="bup-field">
                <label htmlFor="bup-email">
                  Email address{" "}
                  <span className="bup-optional">(optional)</span>
                </label>
                <input
                  id="bup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="bup-grid-2">
                <div className="bup-field">
                  <label htmlFor="bup-employer">
                    Employer / school district <span className="bup-req">*</span>
                  </label>
                  <input
                    id="bup-employer"
                    name="employer"
                    type="text"
                    required
                    value={form.employer}
                    onChange={(e) => update("employer", e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="bup-field">
                  <label htmlFor="bup-workLocation">
                    School or work location <span className="bup-req">*</span>
                  </label>
                  <input
                    id="bup-workLocation"
                    name="workLocation"
                    type="text"
                    required
                    value={form.workLocation}
                    onChange={(e) => update("workLocation", e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="bup-field">
                <label htmlFor="bup-jobTitle">
                  Job title <span className="bup-req">*</span>
                </label>
                <input
                  id="bup-jobTitle"
                  name="jobTitle"
                  type="text"
                  required
                  value={form.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                  disabled={busy}
                />
              </div>

              <fieldset className="bup-field" disabled={busy}>
                <legend className="bup-label">
                  Are you a union member? <span className="bup-req">*</span>
                </legend>
                <div className="bup-radio-row cols-3" role="radiogroup">
                  {UNION_MEMBER_OPTIONS.map((option) => (
                    <label key={option} className="bup-radio">
                      <input
                        type="radio"
                        name="unionMember"
                        value={option}
                        checked={form.unionMember === option}
                        onChange={() => update("unionMember", option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="bup-field" disabled={busy}>
                <legend className="bup-label">
                  Are you a union steward or officer?{" "}
                  <span className="bup-req">*</span>
                </legend>
                <div className="bup-radio-row cols-3" role="radiogroup">
                  {STEWARD_OFFICER_OPTIONS.map((option) => (
                    <label key={option} className="bup-radio">
                      <input
                        type="radio"
                        name="stewardOrOfficer"
                        value={option}
                        checked={form.stewardOrOfficer === option}
                        onChange={() => update("stewardOrOfficer", option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="bup-field">
                <label htmlFor="bup-learnGoals">
                  What would you like to learn at this class?{" "}
                  <span className="bup-optional">(optional)</span>
                </label>
                <textarea
                  id="bup-learnGoals"
                  name="learnGoals"
                  rows={3}
                  value={form.learnGoals}
                  onChange={(e) => update("learnGoals", e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="bup-field">
                <label htmlFor="bup-accommodations">
                  Do you need language assistance or accommodations to attend?{" "}
                  <span className="bup-optional">(optional)</span>
                </label>
                <textarea
                  id="bup-accommodations"
                  name="accommodations"
                  rows={3}
                  value={form.accommodations}
                  onChange={(e) => update("accommodations", e.target.value)}
                  disabled={busy}
                />
              </div>

              <fieldset className="bup-field" disabled={busy}>
                <legend className="bup-label">
                  May we text or email you reminders about this class?{" "}
                  <span className="bup-req">*</span>
                </legend>
                <div className="bup-radio-row cols-2" role="radiogroup">
                  {REMINDER_CONSENT_OPTIONS.map((option) => (
                    <label key={option} className="bup-radio">
                      <input
                        type="radio"
                        name="reminderConsent"
                        value={option}
                        checked={form.reminderConsent === option}
                        onChange={() => update("reminderConsent", option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              {error ? (
                <div className="bup-error" role="alert">
                  {error}
                </div>
              ) : null}

              <button className="bup-submit" type="submit" disabled={busy}>
                {busy ? "Submitting Registration..." : "Register for Class"}
              </button>
            </form>
          )}
        </section>

        <p className="bup-footer">
          IUPAT District Council 78 / Local 1010 Public Sector
        </p>
      </div>
    </div>
  );
}
