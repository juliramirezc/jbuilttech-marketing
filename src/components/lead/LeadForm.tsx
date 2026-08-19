"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type Ref } from "react";
import { pushDataLayerEvent } from "@/lib/analytics";
import type { LeadFormSource } from "./LeadProvider";

export type LeadFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
};

const EMPTY: LeadFormState = { name: "", company: "", email: "", phone: "" };

type LeadFormProps = {
  source: LeadFormSource;
  /** Visual chrome: glass card (hero/final) vs bare (modal) */
  variant?: "card" | "bare";
  headline?: string;
  supporting?: string;
  submitLabel?: string;
  idPrefix?: string;
  onSubmitted?: () => void;
  onFocusChange?: (focused: boolean) => void;
  /** Fired once when any field is focused or receives input */
  onInteracted?: () => void;
  className?: string;
  /** When true, fire a one-time view event for this form instance */
  trackView?: boolean;
};

function eventNameFor(
  source: LeadFormSource,
  kind: "started" | "submitted" | "error" | "view"
): string {
  if (source === "hero_inline") {
    if (kind === "view") return "hero_lead_form_view";
    if (kind === "started") return "hero_lead_form_started";
    if (kind === "submitted") return "hero_lead_form_submitted";
    return "hero_lead_form_error";
  }
  if (source === "final_form") {
    if (kind === "view") return "final_lead_form_view";
    if (kind === "started") return "final_lead_form_started";
    if (kind === "submitted") return "final_lead_form_submitted";
    return "final_lead_form_error";
  }
  // Modal / popup / section CTAs
  if (kind === "started") return "lead_form_started";
  if (kind === "submitted") return "lead_form_submitted";
  if (kind === "error") return "lead_form_error";
  return "lead_form_view";
}

/**
 * Shared lead capture form — used inline (hero/final) and inside LeadModal.
 * Submits to POST /api/leads. Does not duplicate backend logic.
 */
export function LeadForm({
  source,
  variant = "card",
  headline = "PUT YOUR WORK WHERE HOMEOWNERS ARE LOOKING.",
  supporting = "You've already done the work. Let us show you how JBuiltTech can help more homeowners find it.",
  submitLabel = "GET MY COMPANY FOUND",
  idPrefix = "lead",
  onSubmitted,
  onFocusChange,
  onInteracted,
  className = "",
  trackView = false,
}: LeadFormProps) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const interactedRef = useRef(false);
  const [form, setForm] = useState<LeadFormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!trackView || viewedRef.current) return;
    viewedRef.current = true;
    pushDataLayerEvent(eventNameFor(source, "view"), { source });
  }, [trackView, source]);

  const markInteracted = () => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    onInteracted?.();
  };

  const markStarted = () => {
    markInteracted();
    if (startedRef.current) return;
    startedRef.current = true;
    pushDataLayerEvent(eventNameFor(source, "started"), { source });
  };

  const handleFocus = () => {
    markInteracted();
    onFocusChange?.(true);
  };

  const handleBlur = (e: FocusEvent<HTMLFormElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    onFocusChange?.(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || status === "success") return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, source }),
        cache: "no-store",
      });

      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
        pushDataLayerEvent(eventNameFor(source, "error"), { source });
        return;
      }

      setStatus("success");
      setForm(EMPTY);
      pushDataLayerEvent(eventNameFor(source, "submitted"), { source });
      onSubmitted?.();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      pushDataLayerEvent(eventNameFor(source, "error"), { source });
    }
  };

  const shellClass =
    variant === "card"
      ? "rounded-2xl border border-white/10 bg-[#101010]/95 p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md"
      : "";

  if (status === "success") {
    return (
      <div className={`${shellClass} ${className}`.trim()}>
        <div className="py-8 text-center">
          <p className="text-xl font-semibold text-white mb-2">Got it.</p>
          <p className="text-white/70 text-sm">
            We&apos;ll be in touch about getting your company found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      {headline ? (
        <h2
          id={titleId}
          className="text-lg sm:text-xl font-semibold text-white tracking-tight mb-2 leading-snug"
        >
          {headline}
        </h2>
      ) : null}
      {supporting ? (
        <p className="text-sm text-white/65 font-light leading-relaxed mb-5">
          {supporting}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-3.5"
        noValidate
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-labelledby={headline ? titleId : undefined}
      >
        <Field
          ref={firstFieldRef}
          id={`${idPrefix}-name`}
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={(v) => {
            markStarted();
            setForm((f) => ({ ...f, name: v }));
          }}
          required
        />
        <Field
          id={`${idPrefix}-company`}
          label="Company Name"
          autoComplete="organization"
          value={form.company}
          onChange={(v) => {
            markStarted();
            setForm((f) => ({ ...f, company: v }));
          }}
          required
        />
        <Field
          id={`${idPrefix}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={(v) => {
            markStarted();
            setForm((f) => ({ ...f, email: v }));
          }}
          required
        />
        <Field
          id={`${idPrefix}-phone`}
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(v) => {
            markStarted();
            setForm((f) => ({ ...f, phone: v }));
          }}
          required
        />

        {errorMessage ? (
          <p className="text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-conversion w-full mt-1"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : submitLabel}
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
  ref?: Ref<HTMLInputElement>;
};

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  required,
  ref,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white/85">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
      />
    </div>
  );
}
