import { test, expect, ROUTES, isMobile, focusedName } from "./fixtures";

for (const route of ROUTES) {
  test(`${route} returns 200 with exactly one h1`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test.describe("not found", () => {
  test.use({ allowedConsole: [/status of 404/] });

  test("/nope returns 404 with the not-found page", async ({ page }) => {
    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page not found",
    );
  });

  test("/services is 404 while SERVICES_ENABLED is off", async ({ page }) => {
    const res = await page.goto("/services");
    expect(res?.status()).toBe(404);
  });
});

test("favicon is the KW SVG", async ({ page, request }) => {
  await page.goto("/");
  const href = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href");
  expect(href).toContain(".svg");
  expect((await request.get(href!)).status()).toBe(200);
});

test("tab order and visible focus", async ({ page, browserName }) => {
  test.skip(
    browserName === "webkit",
    "WebKit skips links on Tab by default (macOS setting)",
  );
  await page.goto("/");
  const expected = isMobile(page)
    ? ["Skip to content", "Kyle Whynott, home", "Contact", "Menu"]
    : [
        "Skip to content",
        "Kyle Whynott, home",
        "Work",
        "Blog",
        /^Theme: /,
        "Contact",
      ];
  for (const want of expected) {
    await page.keyboard.press("Tab");
    const name = await focusedName(page);
    if (want instanceof RegExp) expect(name).toMatch(want);
    else expect(name).toBe(want);
    const outline = await page.evaluate(
      () => getComputedStyle(document.activeElement!).outlineStyle,
    );
    expect(outline, `focus ring on ${name}`).not.toBe("none");
  }
});

test("skip link moves focus to main", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit skips links on Tab by default");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("mobile menu: opens, Escape closes and returns focus, link closes it", async ({
  page,
}) => {
  test.skip(!isMobile(page), "mobile only");
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  const panel = page.locator("#mobile-menu");
  await expect(panel).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("link", { name: "Work" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await panel.getByRole("link", { name: "Blog" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(panel).toBeHidden();
});
