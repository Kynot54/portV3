import { test as base, expect, type Page } from "@playwright/test";

/** Fails any test that logs a console error or throws, except messages it allows. */
export const test = base.extend<{
  allowedConsole: RegExp[];
  consoleErrors: string[];
}>({
  allowedConsole: [[], { option: true }],
  consoleErrors: [
    async ({ page, allowedConsole }, use) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (
          m.type() === "error" &&
          !allowedConsole.some((re) => re.test(m.text()))
        )
          errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(e.message));
      await use(errors);
      expect(errors, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

export const ROUTES = ["/", "/work", "/blog", "/contact"] as const;
export const isMobile = (page: Page) =>
  (page.viewportSize()?.width ?? 1440) < 640;

/** next-themes' storage key. */
export async function storeTheme(
  page: Page,
  theme: "light" | "dark" | "system",
) {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
}

export const htmlClass = (page: Page) =>
  page.evaluate(() => document.documentElement.className);

/** Accessible name of the focused element. */
export const focusedName = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "";
  });
