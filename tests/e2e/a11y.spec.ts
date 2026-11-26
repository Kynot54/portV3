import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect, ROUTES, isMobile, storeTheme } from "./fixtures";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/*
 * Kyle's call (Conflicts flagged in the PR): the logo shows "KW" but is named
 * "Kyle Whynott, home", which fails WCAG 2.5.3 label-in-name. Waive that one
 * rule for the logo only; any other mismatch still fails.
 */
const LOGO = 'a[aria-label="Kyle Whynott, home"]';

/** The theme toggle gets its real label only after hydration. */
const hydrated = (page: Page) =>
  page.waitForFunction(() =>
    document
      .querySelector(".theme-toggle")
      ?.getAttribute("aria-label")
      ?.startsWith("Theme:"),
  );

async function scan(page: Page) {
  // Let open/close animations settle so axe reads final colours.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished)),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  return violations
    .map((v) =>
      v.id === "label-content-name-mismatch"
        ? {
            ...v,
            nodes: v.nodes.filter(
              (n) =>
                !n.target.includes(LOGO) &&
                !String(n.html).includes('aria-label="Kyle Whynott, home"'),
            ),
          }
        : v,
    )
    .filter((v) => v.nodes.length > 0);
}

for (const theme of ["dark", "light"] as const) {
  for (const route of ROUTES) {
    test(`axe: ${route} in ${theme}`, async ({ page }) => {
      await storeTheme(page, theme);
      await page.goto(route);
      await hydrated(page);
      expect(await scan(page)).toEqual([]);
    });
  }

  test(`axe: mobile menu open in ${theme}`, async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");
    await storeTheme(page, theme);
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
}
