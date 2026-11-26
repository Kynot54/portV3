import { test, expect, ROUTES } from "./fixtures";

// Viewport sweeps run once, on desktop Chromium.
test.beforeEach(({}, info) =>
  test.skip(info.project.name !== "desktop", "desktop project only"),
);

const SIZES = [
  { width: 320, height: 640 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 667, height: 375 }, // landscape phone
];

const noHorizontalScroll = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

for (const size of SIZES) {
  test(`no horizontal scroll at ${size.width}×${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    for (const route of ROUTES) {
      await page.goto(route);
      expect(await noHorizontalScroll(page), route).toBe(true);
    }
  });
}

test("200% zoom: no horizontal scroll, pill not clipped", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => (document.documentElement.style.zoom = "2"));
  expect(await noHorizontalScroll(page)).toBe(true);
  const box = await page
    .getByRole("navigation", { name: "Main" })
    .boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
});

test("menu button below 640px, full pill from 640px", async ({ page }) => {
  await page.setViewportSize({ width: 639, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  await page.setViewportSize({ width: 640, height: 800 });
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Work" }),
  ).toBeVisible();
});

const hydrated = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() =>
    document
      .querySelector(".theme-toggle")
      ?.getAttribute("aria-label")
      ?.startsWith("Theme:"),
  );

const focused = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      name: el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "",
      isBody: el === document.body,
      visible: !!el && el.checkVisibility(),
    };
  });

test("resize mobile → desktop with focus in the open menu keeps focus on the same item", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Menu" }).click();
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Blog" })
    .focus();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("#mobile-menu")).toBeHidden();
  await expect
    .poll(() => focused(page))
    .toEqual({ name: "Blog", isBody: false, visible: true });
});

test("resize mobile → desktop with focus on Menu moves focus to a visible nav item", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("button", { name: "Menu" }).focus();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect
    .poll(async () => {
      const f = await focused(page);
      return !f.isBody && f.visible;
    })
    .toBe(true);
});

test("resize desktop → mobile with focus on a nav link moves focus to Menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await hydrated(page);
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Work" })
    .focus();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect
    .poll(() => focused(page))
    .toEqual({ name: "Menu", isBody: false, visible: true });
});

test("focused elements are never hidden under the fixed nav (WCAG 2.4.11)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  const ok = await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "3000px";
    const btn = document.createElement("button");
    btn.textContent = "probe";
    document.querySelector("main")!.append(btn, spacer);
    window.scrollTo(0, document.body.scrollHeight);
    btn.focus();
    const nav = document
      .querySelector('nav[aria-label="Main"]')!
      .getBoundingClientRect();
    return btn.getBoundingClientRect().top >= nav.bottom;
  });
  expect(ok).toBe(true);
});

test("hero type scales: <32px at 375, >40px at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  const size = () =>
    page
      .locator("h1")
      .evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
  expect(await size()).toBeLessThan(32);
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(await size()).toBeGreaterThan(40);
});
