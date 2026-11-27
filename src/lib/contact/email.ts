import type { ContactInput, ContactSource } from "./validate";

export const FROM = "kwhynott.dev contact <onboarding@resend.dev>";

// Control characters and Unicode line/paragraph separators become a space, so
// no field can start a new header or a fake line in the body.
const oneLine = (s: string) => s.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ");

/** The notification Kyle receives. Plain text only; Reply goes to the visitor. */
export function buildEmail(
  data: ContactInput,
  to: string,
  source: ContactSource = "contact",
) {
  const prefix = source === "services" ? "Services" : "Contact";
  const subject = oneLine(
    data.company
      ? `${prefix}: ${data.name} (${data.company})`
      : `${prefix}: ${data.name}`,
  );
  const lines = [
    `Name: ${oneLine(data.name)}`,
    `Email: ${data.email}`,
    data.company && `Company: ${oneLine(data.company)}`,
    data.role && `Role: ${oneLine(data.role)}`,
  ].filter(Boolean);
  return {
    from: FROM,
    to,
    reply_to: data.email,
    subject,
    text: `${lines.join("\n")}\n\n${data.message}`,
  };
}
