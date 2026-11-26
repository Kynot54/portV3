import { securityHeaders } from "@/lib/security-headers";

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.cal.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com https://app.cal.com https://cal.com https://cloudflareinsights.com",
  "frame-src https://challenges.cloudflare.com https://app.cal.com https://cal.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const asMap = (h: { key: string; value: string }[]) =>
  Object.fromEntries(h.map(({ key, value }) => [key, value]));

test("production policy is exact", () => {
  expect(
    asMap(securityHeaders({ VERCEL: "1", VERCEL_ENV: "production" })),
  ).toEqual({
    "Content-Security-Policy": PROD_CSP,
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    "X-Frame-Options": "DENY",
  });
});

const directives = (csp: string) =>
  Object.fromEntries(
    csp.split("; ").map((d) => {
      const [name, ...values] = d.split(" ");
      return [name, values];
    }),
  );

// Vercel's documented toolbar policy (vercel.com/docs/vercel-toolbar/managing-toolbar);
// img-src already allows https: and data:, so only blob: is new there.
const TOOLBAR: Record<string, string[]> = {
  "script-src": ["https://vercel.live"],
  "style-src": ["https://vercel.live"],
  "img-src": ["blob:"],
  "font-src": ["https://vercel.live", "https://assets.vercel.com"],
  "connect-src": ["https://vercel.live", "wss://ws-us3.pusher.com"],
  "frame-src": ["https://vercel.live"],
};

test("preview adds the Vercel toolbar's origins and nothing else", () => {
  const prod = directives(PROD_CSP);
  const preview = directives(
    asMap(securityHeaders({ VERCEL: "1", VERCEL_ENV: "preview" }))[
      "Content-Security-Policy"
    ],
  );
  expect(Object.keys(preview)).toEqual(Object.keys(prod));
  for (const name of Object.keys(prod)) {
    expect(preview[name], name).toEqual([
      ...prod[name],
      ...(TOOLBAR[name] ?? []),
    ]);
  }
});

test("next dev adds 'unsafe-eval' to script-src only", () => {
  const prod = directives(PROD_CSP.replace("; upgrade-insecure-requests", ""));
  const dev = directives(
    asMap(securityHeaders({ NODE_ENV: "development" }))[
      "Content-Security-Policy"
    ],
  );
  expect(Object.keys(dev)).toEqual(Object.keys(prod));
  for (const name of Object.keys(prod)) {
    const added = name === "script-src" ? ["'unsafe-eval'"] : [];
    expect(dev[name], name).toEqual([...prod[name], ...added]);
  }
});

test("a production build never allows eval", () => {
  for (const env of [
    { NODE_ENV: "production" },
    { VERCEL: "1", VERCEL_ENV: "production", NODE_ENV: "production" },
  ]) {
    expect(
      asMap(securityHeaders(env))["Content-Security-Policy"],
    ).not.toContain("unsafe-eval");
  }
});

test("off Vercel drops upgrade-insecure-requests only", () => {
  const local = asMap(securityHeaders({}))["Content-Security-Policy"];
  expect(local).toBe(PROD_CSP.replace("; upgrade-insecure-requests", ""));
});
