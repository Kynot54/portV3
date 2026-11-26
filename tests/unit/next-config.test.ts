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
