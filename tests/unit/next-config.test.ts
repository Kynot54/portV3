import { assertPublicEnv } from "@/lib/contact/config";

const both = {
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site",
  NEXT_PUBLIC_CAL_LINK: "kyle/30min",
};

test("assertPublicEnv throws in production when a public var is missing", () => {
  expect(() =>
    assertPublicEnv({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_CAL_LINK: "kyle/30min",
    }),
  ).toThrow(/NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  expect(() =>
    assertPublicEnv({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "s",
    }),
  ).toThrow(/NEXT_PUBLIC_CAL_LINK/);
  expect(() =>
    assertPublicEnv({ VERCEL_ENV: "production", ...both }),
  ).not.toThrow();
});

test("assertPublicEnv passes outside production", () => {
  expect(() => assertPublicEnv({})).not.toThrow();
  expect(() => assertPublicEnv({ VERCEL_ENV: "preview" })).not.toThrow();
});

test("with Services on, production also needs the consultation link", () => {
  const on = { VERCEL_ENV: "production", SERVICES_ENABLED: "true", ...both };
  expect(() => assertPublicEnv(on)).toThrow(
    /^Services page: set NEXT_PUBLIC_CAL_CONSULT_LINK/,
  );
  expect(() =>
    assertPublicEnv({ ...on, NEXT_PUBLIC_CAL_CONSULT_LINK: "kyle/consult" }),
  ).not.toThrow();
  // Off: not needed. Preview: never checked.
  expect(() =>
    assertPublicEnv({ VERCEL_ENV: "production", ...both }),
  ).not.toThrow();
  expect(() =>
    assertPublicEnv({ VERCEL_ENV: "preview", SERVICES_ENABLED: "true" }),
  ).not.toThrow();
});

test("the old pipelines URL redirects permanently to Working Entrepreneurs", async () => {
  const { default: config } = await import("../../next.config");
  expect(await config.redirects?.()).toContainEqual({
    source: "/work/ai-document-pipelines",
    destination: "/work/working-entrepreneurs",
    permanent: true,
  });
});
