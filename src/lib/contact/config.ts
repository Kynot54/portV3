type Env = Record<string, string | undefined>;

const SERVER_ENV = [
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "TURNSTILE_SECRET_KEY",
] as const;

/** Names (never values) of server settings that are missing or blank. */
export function missingServerEnv(env: Env): string[] {
  return SERVER_ENV.filter((k) => !env[k]?.trim());
}

/** Test-only: skip Turnstile and Resend. Never honoured in production. */
export function isFakeSend(env: Env): boolean {
  return env.CONTACT_FAKE_SEND === "1" && env.VERCEL_ENV !== "production";
}
