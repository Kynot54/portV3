import type { buildEmail } from "./email";

/** One request to Resend's REST API (no SDK). Never throws. */
export async function sendEmail(
  email: ReturnType<typeof buildEmail>,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });
    if (!res.ok) return { ok: false };
    const json = (await res.json()) as { id?: unknown };
    return typeof json.id === "string"
      ? { ok: true, id: json.id }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}
