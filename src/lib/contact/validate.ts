export type ContactField = "name" | "email" | "company" | "role" | "message";
export type ContactInput = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const FIELDS: ContactField[] = [
  "name",
  "email",
  "company",
  "role",
  "message",
];

export const LIMITS: Record<ContactField, { min?: number; max: number }> = {
  name: { min: 1, max: 100 },
  email: { min: 1, max: 254 },
  company: { max: 100 },
  role: { max: 100 },
  message: { min: 10, max: 5000 },
};

const REQUIRED: Partial<Record<ContactField, string>> = {
  name: "Enter your name.",
  email: "Enter a valid email address.",
  message: "Write a message of at least 10 characters.",
};

// Conservative address check (RFC 5322 "dot-atom" local part, hostname labels):
// no whitespace, quotes, brackets, commas or empty dot segments, so anything that
// passes is safe as Reply-To and won't be refused by Resend.
const ATOM = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?";
const EMAIL = new RegExp(`^${ATOM}(?:\\.${ATOM})*@${LABEL}(?:\\.${LABEL})+$`);

/** Shared by the form (before sending) and /api/contact (always). */
export function validateContact(
  raw: unknown,
): { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors } {
  const src =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const data = Object.fromEntries(
    FIELDS.map((f) => [f, typeof src[f] === "string" ? src[f].trim() : ""]),
  ) as ContactInput;

  const errors: ContactErrors = {};
  for (const f of FIELDS) {
    const v = data[f];
    const { min = 0, max } = LIMITS[f];
    if (v.length > max) errors[f] = `Keep this under ${max} characters.`;
    else if (v.length < min) errors[f] = REQUIRED[f];
  }
  if (!errors.email && !EMAIL.test(data.email)) errors.email = REQUIRED.email;
  if (errors.email && data.email.length > LIMITS.email.max)
    errors.email = REQUIRED.email;

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data };
}
