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

const PUBLIC_ENV = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "NEXT_PUBLIC_CAL_LINK",
] as const;

/**
 * Public values are baked into the page at build time. A production build
 * without them fails, so a broken contact page never ships (next.config.ts).
 */
export function assertPublicEnv(env: Env): void {
  if (env.VERCEL_ENV !== "production") return;
  const missing = PUBLIC_ENV.filter((k) => !env[k]?.trim());
  if (missing.length)
    throw new Error(
      `Contact page: set ${missing.join(" and ")} in Vercel (Production) before deploying.`,
    );
}
