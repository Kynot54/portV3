import { test, expect, isMobile, storeTheme, htmlClass } from "./fixtures";

test("OS dark → dark, OS light → light", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(await htmlClass(page)).toContain("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  expect(await htmlClass(page)).toContain("light");
  expect(await htmlClass(page)).not.toMatch(/\bdark\b/);
});

test("stored light beats OS dark on first paint and after navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await storeTheme(page, "light");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await htmlClass(page)).toMatch(/\blight\b/);
  if (isMobile(page)) await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Work" }).first().click();
  await expect(page).toHaveURL(/\/work$/);
  expect(await htmlClass(page)).toMatch(/\blight\b/);
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await htmlClass(page)).toMatch(/\blight\b/);
});

test("toggle cycles, persists across reload, and names itself", async ({
  page,
}) => {
  test.skip(
    isMobile(page),
    "desktop toggle; mobile toggle is covered in the menu",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /^Theme: / });
  await expect(toggle).toHaveAccessibleName("Theme: System. Switch to light");
  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Theme: Light. Switch to dark");
  expect(await htmlClass(page)).toMatch(/\blight\b/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: /^Theme: / }),
  ).toHaveAccessibleName("Theme: Light. Switch to dark");
  expect(await htmlClass(page)).toMatch(/\blight\b/);
});

test("system follows OS change live", async ({ page }) => {
  test.skip(isMobile(page), "uses the desktop toggle");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /^Theme: / });
  await toggle.click(); // light
  await toggle.click(); // dark
  await toggle.click(); // system
  await expect(toggle).toHaveAccessibleName("Theme: System. Switch to light");
  expect(await htmlClass(page)).toMatch(/\blight\b/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => htmlClass(page)).toMatch(/\bdark\b/);
});

test("toggle works when localStorage throws", async ({ page }) => {
  test.skip(isMobile(page), "uses the desktop toggle");
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new Error("SecurityError");
    };
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(await htmlClass(page)).toMatch(/\bdark\b/);
  await page.getByRole("button", { name: /^Theme: / }).click();
  expect(await htmlClass(page)).toMatch(/\blight\b/);
});

test("no-JS renders dark, hides toggle and menu button, links reachable", async ({
  browser,
}, info) => {
  const viewport = info.project.use.viewport ?? { width: 1440, height: 900 };
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "light",
    viewport,
  });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await htmlClass(page)).toMatch(/\bdark\b/);
  for (const t of await page.locator(".theme-toggle").all())
    await expect(t).toBeHidden();
  await expect(page.locator(".menu-button")).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Work" }).locator("visible=true"),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Blog" }).locator("visible=true"),
  ).toHaveCount(1);
  // Nothing may cover the page heading.
  const h1Uncovered = await page.locator("h1").evaluate((h) => {
    const r = h.getBoundingClientRect();
    const hit = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height / 2,
    );
    return !!hit && (hit === h || h.contains(hit));
  });
  expect(h1Uncovered, "h1 covered by the nav without JS").toBe(true);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await ctx.close();
});

test("reduced motion: no transitions on nav links", async ({
  browser,
}, info) => {
  const viewport = info.project.use.viewport ?? { width: 1440, height: 900 };
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport });
  const page = await ctx.newPage();
  await page.goto("/");
  const durations = await page
    .locator("nav a")
    .evaluateAll((els) =>
      els.map((e) => getComputedStyle(e).transitionDuration),
    );
  for (const d of durations)
    expect(d.split(",").every((x) => parseFloat(x) === 0)).toBe(true);
  await ctx.close();
});
