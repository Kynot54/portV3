type Env = Record<string, string | undefined>;

const TURNSTILE = "https://challenges.cloudflare.com";
const CAL_APP = "https://app.cal.com";
const CAL = "https://cal.com";
const CF_BEACON = "https://static.cloudflareinsights.com"; // Cloudflare Web Analytics (Kyle keeps it on)
const CF_INSIGHTS = "https://cloudflareinsights.com";
const VERCEL_LIVE = "https://vercel.live";

/**
 * One fixed policy for every page, so pages stay prebuilt (Kyle chose this over
 * per-request nonces). Inline scripts are allowed because Next and the theme
 * switcher need them; the site never renders visitor-supplied HTML.
 * - Vercel previews also allow Vercel's toolbar (its documented origins).
 * - `next dev` also allows eval: React uses it to rebuild server error stacks.
 * - Off Vercel (local, CI) skips upgrade-insecure-requests: tests run on http.
 */
export function securityHeaders(env: Env): { key: string; value: string }[] {
  const on = (cond: boolean, ...values: string[]) => (cond ? values : []);
  const preview = env.VERCEL_ENV === "preview";
  const dev = env.NODE_ENV === "development";
  const csp: [string, string[]][] = [
    ["default-src", ["'self'"]],
    [
      "script-src",
      [
        "'self'",
        "'unsafe-inline'",
        TURNSTILE,
        CAL_APP,
        CF_BEACON,
        ...on(preview, VERCEL_LIVE),
        ...on(dev, "'unsafe-eval'"),
      ],
    ],
    ["style-src", ["'self'", "'unsafe-inline'", ...on(preview, VERCEL_LIVE)]],
    ["img-src", ["'self'", "data:", "https:", ...on(preview, "blob:")]],
    [
      "font-src",
      ["'self'", ...on(preview, VERCEL_LIVE, "https://assets.vercel.com")],
    ],
    [
      "connect-src",
      [
        "'self'",
        TURNSTILE,
        CAL_APP,
        CAL,
        CF_INSIGHTS,
        ...on(preview, VERCEL_LIVE, "wss://ws-us3.pusher.com"),
      ],
    ],
    ["frame-src", [TURNSTILE, CAL_APP, CAL, ...on(preview, VERCEL_LIVE)]],
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
  ];
  const policy = [
    ...csp.map(([name, values]) => `${name} ${values.join(" ")}`),
    ...(env.VERCEL ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: policy },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "X-Frame-Options", value: "DENY" },
  ];
}
