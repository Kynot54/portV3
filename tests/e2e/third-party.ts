import type { Page } from "@playwright/test";

export const THIRD_PARTY = /challenges\.cloudflare\.com|cal\.com/;

/** Serve stand-ins for Turnstile and Cal.com; never reach the real services. */
export async function stubThirdParty(page: Page, { calFails = false } = {}) {
  await page.route("https://challenges.cloudflare.com/**", (r) =>
    r.fulfill({
      path: "tests/e2e/stubs/turnstile.js",
      contentType: "text/javascript",
    }),
  );
  await page.route("https://app.cal.com/**", (r) =>
    calFails
      ? r.abort()
      : r.fulfill({
          path: "tests/e2e/stubs/cal.js",
          contentType: "text/javascript",
        }),
  );
  await page.route("https://cal.com/**", (r) => r.abort());
}

export async function fill(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Ada");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Hello there, Kyle.");
}
