import { z } from "zod";

export const UNION_MEMBER_OPTIONS = ["Yes", "No", "Not sure"] as const;
export const STEWARD_OFFICER_OPTIONS = [
  "Steward",
  "Officer",
  "Neither",
] as const;
export const REMINDER_CONSENT_OPTIONS = ["Yes", "No"] as const;

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidUsPhone(phone: string): boolean {
  const digits = digitsOnly(phone);
  // 10-digit US, or 11-digit starting with country code 1
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

export const marionRegistrationSchema = z
  .object({
    fullName: z.string().min(1).max(200),
    cellphone: z.string().min(7).max(40),
    email: z.string().max(254).optional().default(""),
    employer: z.string().min(1).max(200),
    workLocation: z.string().min(1).max(200),
    jobTitle: z.string().min(1).max(200),
    unionMember: z.enum(UNION_MEMBER_OPTIONS),
    stewardOrOfficer: z.enum(STEWARD_OFFICER_OPTIONS),
    learnGoals: z.string().max(2000).optional().default(""),
    accommodations: z.string().max(2000).optional().default(""),
    reminderConsent: z.enum(REMINDER_CONSENT_OPTIONS),
  })
  .superRefine((data, ctx) => {
    if (!data.fullName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name is required",
        path: ["fullName"],
      });
    }
    if (!isValidUsPhone(data.cellphone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid US phone number",
        path: ["cellphone"],
      });
    }
    const email = (data.email || "").trim();
    if (email) {
      const emailOk = z.string().email().safeParse(email).success;
      if (!emailOk) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address",
          path: ["email"],
        });
      }
    }
    if (!data.employer.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer / school district is required",
        path: ["employer"],
      });
    }
    if (!data.workLocation.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "School or work location is required",
        path: ["workLocation"],
      });
    }
    if (!data.jobTitle.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Job title is required",
        path: ["jobTitle"],
      });
    }
  });

export type MarionRegistrationInput = z.infer<typeof marionRegistrationSchema>;

/** Shared alias for future county forms (same field set). */
export const buildingUnionPowerRegistrationSchema = marionRegistrationSchema;
export type BuildingUnionPowerRegistrationInput = MarionRegistrationInput;

/** Prevent spreadsheet formula injection; keep participant text literal. */
export function asLiteralSheetText(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^[=+\-@\t\r]/.test(v)) return `'${v}`;
  return v;
}

export function formatNyTimestamp(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}
