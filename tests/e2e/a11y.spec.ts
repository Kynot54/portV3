import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect, ROUTES, isMobile, storeTheme } from "./fixtures";

const A11Y_ROUTES = [
  ...ROUTES,
  "/work/working-entrepreneurs",
  "/work/control-bh",
  "/work/ulti-health",
  "/work/video-interview-plugin",
  "/work/ai-mind-companion",
  "/work/sample-media",
  "/blog/sample-formatting",
  "/blog/sample-long-read",
];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The theme toggle gets its real label only after hydration. */
const hydrated = (page: Page) =>
  page.waitForFunction(() =>
    document
      .querySelector(".theme-toggle")
      ?.getAttribute("aria-label")
      ?.startsWith("Theme:"),
  );

async function scan(page: Page, exclude?: string) {
  // Let open/close animations settle so axe reads final colours.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        // Infinite animations (the hero visual) never finish; only wait for finite ones.
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        // A transition cancelled by a state change rejects; that still counts as settled.
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  let axe = new AxeBuilder({ page }).withTags(TAGS);
  // Third-party frames: skip them entirely (axe entering an empty stub frame crashes Firefox).
  if (exclude) axe = axe.exclude(exclude).options({ iframes: false });
  const { violations } = await axe.analyze();
  return violations;
}

for (const theme of ["dark", "light"] as const) {
  for (const route of A11Y_ROUTES) {
    test(`axe: ${route} in ${theme}`, async ({ page }) => {
      await storeTheme(page, theme);
      await page.goto(route);
      await hydrated(page);
      expect(await scan(page)).toEqual([]);
    });
  }

  test(`axe: blog list fully expanded in ${theme}`, async ({ page }) => {
    await storeTheme(page, theme);
    await page.goto("/blog");
    await hydrated(page);
    await page.evaluate(() =>
      document.querySelectorAll("details").forEach((d) => (d.open = true)),
    );
    await expect(page.locator(".blog-entry-body").first()).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });

  test(`axe: contact form states in ${theme}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "firefox",
      "axe crashes Firefox ('Page crashed') once any form field has had focus; the page itself works there (contact.spec passes). Chromium and WebKit scan these states.",
    );
    await page.route("https://challenges.cloudflare.com/**", (r) =>
      r.fulfill({
        path: "tests/e2e/stubs/turnstile.js",
        contentType: "text/javascript",
      }),
    );
    await page.route("https://app.cal.com/**", (r) =>
      r.fulfill({
        path: "tests/e2e/stubs/cal.js",
        contentType: "text/javascript",
      }),
    );
    await storeTheme(page, theme);
    await page.goto("/contact");
    await hydrated(page);
    // Third-party iframes (Turnstile, Cal.com) are content we can't fix.
    const own = "iframe";
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
    expect(await scan(page, own), "error state").toEqual([]);
    await page.getByLabel("Name", { exact: true }).fill("Ada");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page
      .getByLabel("Message", { exact: true })
      .fill("Hello there, Kyle.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("main").getByRole("status")).not.toBeEmpty();
    expect(await scan(page, own), "sent state").toEqual([]);
    await page.getByRole("button", { name: "Book a call" }).click();
    await expect(
      page.getByRole("region", { name: "Booking calendar" }).locator("iframe"),
    ).toBeVisible();
    expect(await scan(page, own), "calendar open").toEqual([]);
  });

  test(`axe: mobile menu open in ${theme}`, async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");
    await storeTheme(page, theme);
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`nav text keeps ≥ 4.5:1 over any content scrolled under the pill (${theme})`, async ({
    page,
  }) => {
    await storeTheme(page, theme);
    await page.goto("/");
    await hydrated(page);
    const worst = await page.evaluate(() => {
      // Let the browser resolve any colour syntax (oklab, color(), …) to sRGB 0–255.
      const ctx = document.createElement("canvas").getContext("2d")!;
      const parse = (c: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b, a / 255];
      };
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) =>
          (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a: number[], b: number[]) => {
        const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
        return (x + 0.05) / (y + 0.05);
      };
      const nav = document.querySelector('nav[aria-label="Main"]')!;
      const [r, g, b, a = 1] = parse(getComputedStyle(nav).backgroundColor);
      const link = document.querySelector(
        'nav[aria-label="Main"] a[href="/work"]',
      )!;
      const fg = parse(getComputedStyle(link).color).slice(0, 3);
      // Worst case: whatever scrolls under the pill is pure black or pure white.
      return Math.min(
        ...[0, 255].map((under) =>
          ratio(
            fg,
            [r, g, b].map((c) => c * a + under * (1 - a)),
          ),
        ),
      );
    });
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
}
