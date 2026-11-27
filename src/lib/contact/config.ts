import { isServicesEnabled } from "../flags";

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

/** Test-only: skip Turnstile and Resend. Never honoured on any Vercel deployment. */
export function isFakeSend(env: Env): boolean {
  return (
    env.CONTACT_FAKE_SEND === "1" &&
    !env.VERCEL &&
    env.VERCEL_ENV !== "production"
  );
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
  const pages = [
    { page: "Contact page", keys: PUBLIC_ENV },
    // The Services page books on its own Cal.com event.
    ...(isServicesEnabled(env)
      ? [
          {
            page: "Services page",
            keys: ["NEXT_PUBLIC_CAL_CONSULT_LINK"] as const,
          },
        ]
      : []),
  ];
  const problems = pages
    .map(({ page, keys }) => ({
      page,
      missing: keys.filter((k) => !env[k]?.trim()),
    }))
    .filter((p) => p.missing.length)
    .map((p) => `${p.page}: set ${p.missing.join(" and ")}`);
  if (problems.length)
    throw new Error(
      `${problems.join("; ")} in Vercel (Production) before deploying.`,
    );
}
