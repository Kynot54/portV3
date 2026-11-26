import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const THIRD_PARTY = /challenges\.cloudflare\.com|cal\.com/;

/** Serve stand-ins for Turnstile and Cal.com; never reach the real services. */
async function stubThirdParty(page: Page, { calFails = false } = {}) {
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

async function fill(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Ada");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Hello there, Kyle.");
}

test("no third-party request before interaction", async ({ page }) => {
  await stubThirdParty(page);
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  await page.goto("/contact");
  await page.waitForLoadState("networkidle");
  expect(urls.filter((u) => THIRD_PARTY.test(u))).toEqual([]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
});

test("send a message end to end", async ({ page }) => {
  await stubThirdParty(page);
  await page.goto("/contact");
  const turnstile = page.waitForRequest(/challenges\.cloudflare\.com/);
  await page.getByLabel("Name", { exact: true }).focus();
  await turnstile;
  await fill(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("main").getByRole("status")).toHaveText(
    "Thanks, your message is on its way. I reply within 2–3 business days.",
  );
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
});

test("field errors are announced and focused", async ({ page }) => {
  await stubThirdParty(page);
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  await expect(
    page.getByLabel("Name", { exact: true }),
  ).toHaveAccessibleDescription("Enter your name.");
});

test.describe("server failure", () => {
  test.use({ allowedConsole: [/status of 500/] });
  test("failure line on a 500", async ({ page }) => {
    await stubThirdParty(page);
    await page.route("**/api/contact", (r) =>
      r.fulfill({
        status: 500,
        contentType: "application/json",
        body: '{"ok":false}',
      }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("main").getByRole("alert")).toHaveText(
      "Something went wrong. Try again, or book a call instead.",
    );
  });
});

test("Book a call loads the calendar full width and focuses it", async ({
  page,
}, info) => {
  await stubThirdParty(page);
  await page.goto("/contact");
  await page.getByRole("button", { name: "Book a call" }).click();
  const region = page.getByRole("region", { name: "Booking calendar" });
  await expect(region.locator("iframe")).toBeVisible();
  await expect(region).toBeFocused();
  if (info.project.name === "desktop") {
    const grid = (await page.locator("[data-contact-grid]").boundingBox())!;
    const box = (await region.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(grid.width - 1);
    expect(box.y).toBeGreaterThan(grid.y + grid.height - 1);
  }
});

test.describe("embed failure", () => {
  test.use({
    allowedConsole: [/Failed to load resource|ERR_FAILED|embed\.js/],
  });
  test("embed failure shows Open the booking page", async ({ page }) => {
    await stubThirdParty(page, { calFails: true });
    await page.goto("/contact");
    await page.getByRole("button", { name: "Book a call" }).click();
    await expect(
      page.getByRole("link", { name: "Open the booking page" }),
    ).toHaveAttribute("href", "https://cal.com/test/30min");
  });
});

test("no-JS: form hidden, no-JS line and Cal link shown", async ({
  browser,
}, info) => {
  const viewport = info.project.use.viewport ?? { width: 1440, height: 900 };
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport });
  const page = await ctx.newPage();
  await page.goto("/contact");
  await expect(page.getByLabel("Name", { exact: true })).toBeHidden();
  // Playwright's text and role engines skip <noscript>, so match it by CSS.
  const note = page.locator("main noscript p").first();
  await expect(note).toHaveText(
    "Turn on JavaScript to send a message, or book a call below.",
  );
  const link = page.locator("main noscript a");
  await expect(link).toHaveText("Book a call");
  await expect(link).toHaveAttribute("href", "https://cal.com/test/30min");
  for (const el of [note, link])
    expect(
      (await el.boundingBox())?.height ?? 0,
      "rendered without JS",
    ).toBeGreaterThan(0);
  await ctx.close();
});

test("320px: no horizontal scroll", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop", "viewport set explicitly");
  const ctx = await browser.newContext({
    viewport: { width: 320, height: 700 },
  });
  const page = await ctx.newPage();
  await page.goto("/contact");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await ctx.close();
});

test("only one accent button on the page", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("main .accent-glow")).toHaveCount(1);
  await expect(page.locator("main .accent-glow")).toHaveText("Send message");
});
