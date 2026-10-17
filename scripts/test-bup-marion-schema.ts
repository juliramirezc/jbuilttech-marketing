/**
 * Local validation smoke tests for Building Union Power Marion registration.
 * Run: npx tsx scripts/test-bup-marion-schema.ts
 */
import {
  asLiteralSheetText,
  formatNyTimestamp,
  marionRegistrationSchema,
} from "../src/lib/buildingUnionPower/schema";
import { buildMarionRegistrationRow } from "../src/lib/buildingUnionPower/sheets";
import { MARION_REGISTRATION_HEADERS } from "../src/lib/buildingUnionPower/classes";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(msg: string) {
  passed += 1;
  console.log(`✓ ${msg}`);
}

// Required fields reject empty
{
  const r = marionRegistrationSchema.safeParse({
    fullName: "  ",
    cellphone: "9545551234",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "Yes",
    stewardOrOfficer: "Neither",
    reminderConsent: "Yes",
  });
  assert(!r.success, "empty full name should fail");
  ok("rejects empty full name");
}

// Invalid phone
{
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: "123",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "Yes",
    stewardOrOfficer: "Neither",
    reminderConsent: "No",
  });
  assert(!r.success, "invalid phone should fail");
  ok("rejects invalid phone");
}

// Valid phones
for (const phone of ["(954) 555-1234", "9545551234", "1-954-555-1234"]) {
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: phone,
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "Not sure",
    stewardOrOfficer: "Steward",
    reminderConsent: "Yes",
  });
  assert(r.success, `phone ${phone} should pass`);
}
ok("accepts common US phone formats");

// Optional blank email
{
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: "9545551234",
    email: "",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "No",
    stewardOrOfficer: "Officer",
    reminderConsent: "No",
  });
  assert(r.success, "blank email should pass");
  ok("allows blank optional email");
}

// Invalid email rejected
{
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: "9545551234",
    email: "not-an-email",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "Yes",
    stewardOrOfficer: "Neither",
    reminderConsent: "Yes",
  });
  assert(!r.success, "invalid email should fail");
  ok("rejects invalid email");
}

// Reminder consent both options
for (const consent of ["Yes", "No"] as const) {
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: "9545551234",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    unionMember: "Yes",
    stewardOrOfficer: "Neither",
    reminderConsent: consent,
  });
  assert(r.success, `reminderConsent ${consent} should pass`);
}
ok("accepts Yes and No reminder consent");

// Radio required
{
  const r = marionRegistrationSchema.safeParse({
    fullName: "Test User",
    cellphone: "9545551234",
    employer: "District",
    workLocation: "School",
    jobTitle: "Teacher",
    stewardOrOfficer: "Neither",
    reminderConsent: "Yes",
  });
  assert(!r.success, "missing unionMember should fail");
  ok("requires union member selection");
}

// Formula injection
assert(asLiteralSheetText("=HYPERLINK()") === "'=HYPERLINK()", "formula escape");
assert(asLiteralSheetText("normal") === "normal", "normal text");
ok("escapes formula injection");

// Row mapping
{
  const parsed = marionRegistrationSchema.parse({
    fullName: "Ada Lovelace",
    cellphone: "(954) 555-1234",
    email: "",
    employer: "Marion Schools",
    workLocation: "Ocala HS",
    jobTitle: "Aide",
    unionMember: "Yes",
    stewardOrOfficer: "Steward",
    learnGoals: "",
    accommodations: "",
    reminderConsent: "No",
  });
  const ts = formatNyTimestamp(new Date("2026-10-17T15:30:00Z"));
  const row = buildMarionRegistrationRow(parsed, ts);
  assert(row.length === 12, "row length 12");
  assert(row.length === MARION_REGISTRATION_HEADERS.length, "matches headers");
  assert(row[0] === ts, "timestamp");
  assert(row[1] === "Ada Lovelace", "name");
  assert(row[2] === "(954) 555-1234", "phone as text");
  assert(row[3] === "", "blank email");
  assert(row[11] === "No", "consent");
  ok("maps all twelve columns correctly");
}

console.log(`\nAll ${passed} checks passed.`);
