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

test("preview adds vercel.live to script/connect/frame only", () => {
  const prod = directives(PROD_CSP);
  const preview = directives(
    asMap(securityHeaders({ VERCEL: "1", VERCEL_ENV: "preview" }))[
      "Content-Security-Policy"
    ],
  );
  for (const name of Object.keys(prod)) {
    const added = ["script-src", "connect-src", "frame-src"].includes(name)
      ? ["https://vercel.live"]
      : [];
    expect(preview[name], name).toEqual([...prod[name], ...added]);
  }
});

test("off Vercel drops upgrade-insecure-requests only", () => {
  const local = asMap(securityHeaders({}))["Content-Security-Policy"];
  expect(local).toBe(PROD_CSP.replace("; upgrade-insecure-requests", ""));
});
