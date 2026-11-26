import type { ContactInput } from "./validate";

export const FROM = "kwhynott.dev contact <onboarding@resend.dev>";

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ");

/** The notification Kyle receives. Plain text only; Reply goes to the visitor. */
export function buildEmail(data: ContactInput, to: string) {
  const subject = oneLine(
    data.company
      ? `Contact: ${data.name} (${data.company})`
      : `Contact: ${data.name}`,
  );
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company && `Company: ${data.company}`,
    data.role && `Role: ${data.role}`,
  ].filter(Boolean);
  return {
    from: FROM,
    to,
    reply_to: data.email,
    subject,
    text: `${lines.join("\n")}\n\n${data.message}`,
  };
}
