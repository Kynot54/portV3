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

test("resize from mobile to desktop with menu open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("#mobile-menu")).toBeHidden();
  const focusVisible = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return !el || el === document.body || el.offsetParent !== null;
  });
  expect(focusVisible).toBe(true);
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
