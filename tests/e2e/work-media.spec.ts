import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// The sample project (WORK_SAMPLES=1) is the only one with media in e2e builds.
const SAMPLE = 'a[href="/work/sample-media"]';

/** Counts play() calls, so the checks hold whether or not a browser can decode the clip. */
async function countPlays(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __plays: number };
    w.__plays = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      w.__plays++;
      return play.call(this);
    };
  });
}
const plays = (page: Page) =>
  page.evaluate(() => (window as unknown as { __plays: number }).__plays);

async function expectStopped(page: Page) {
  const card = page.locator(SAMPLE);
  await expect(card.locator("[data-playing]")).toHaveAttribute(
    "data-playing",
    "false",
  );
  const state = await card.locator("video").evaluate((v: HTMLVideoElement) => ({
    paused: v.paused,
    t: v.currentTime,
  }));
  expect(state).toEqual({ paused: true, t: 0 });
}

test.describe("card clip (mouse)", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1440,
    "hover behaviour is checked on the desktop projects",
  );
  // A browser that can't decode the sample clip logs nothing; nothing to allow.

  test("hover plays; moving away stops, rewinds and shows the still", async ({
    page,
  }) => {
    await countPlays(page);
    await page.goto("/work");
    await page.locator(SAMPLE).hover();
    await expect.poll(() => plays(page)).toBe(1);
    await page.getByRole("heading", { level: 1 }).hover();
    await expectStopped(page);
  });

  test("keyboard focus plays; moving focus away stops", async ({ page }) => {
    await countPlays(page);
    await page.goto("/work");
    await page.locator(SAMPLE).focus();
    await expect.poll(() => plays(page)).toBe(1);
    await page.locator('a[href="/work/ai-mind-companion"]').focus();
    await expectStopped(page);
  });

  test("reduced motion: hover never plays", async ({ page }) => {
    await countPlays(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    await page.locator(SAMPLE).hover();
    await page.waitForTimeout(300);
    expect(await plays(page)).toBe(0);
  });

  test("moving to another card stops the first", async ({ page }) => {
    await countPlays(page);
    await page.goto("/work");
    for (const href of [
      "/work/sample-media",
      "/work/control-bh",
      "/work/sample-media",
      "/work/working-entrepreneurs",
    ])
      await page.locator(`a[href="${href}"]`).hover();
    await expect(page.locator('[data-playing="true"]')).toHaveCount(0);
    await expectStopped(page);
  });

  test("the thumbnail keeps 16:9 before and after the image loads", async ({
    page,
  }) => {
    await page.goto("/work");
    const box = page.locator(`${SAMPLE} [data-playing]`);
    const ratio = async () => {
      const b = (await box.boundingBox())!;
      return b.width / b.height;
    };
    const before = await ratio();
    await expect(box.locator("img")).toHaveJSProperty("complete", true);
    expect(before).toBeCloseTo(16 / 9, 1);
    expect(await ratio()).toBeCloseTo(before, 3);
  });
});

test("phones and tablets never play the card clip; a tap opens the project", async ({
  browser,
  browserName,
}, info) => {
  test.skip(
    browserName !== "chromium" || info.project.name !== "desktop",
    "one touch device is enough (isMobile is Chromium-only)",
  );
  const ctx = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await ctx.newPage();
  await countPlays(page);
  await page.goto("/work");
  const card = page.locator(SAMPLE);
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(300);
  expect(await plays(page)).toBe(0);
  await card.tap();
  await expect(page).toHaveURL(/\/work\/sample-media$/);
  expect(await plays(page)).toBe(0);
  await ctx.close();
});

test("project page: two images, then See It in Action before What I Learned", async ({
  page,
}) => {
  await page.goto("/work/sample-media");
  await expect(page.getByText("Preview coming soon")).toHaveCount(0);
  await expect(
    page.getByAltText("Sample image one: a dark panel beside a green panel"),
  ).toBeVisible();
  await expect(
    page.getByAltText("Sample image two: a light panel beside a pink panel"),
  ).toBeVisible();
  expect(
    await page.getByRole("heading", { level: 2 }).allTextContents(),
  ).toEqual([
    "Context",
    "What I Built",
    "Result",
    "See It in Action",
    "What I Learned",
    "Built With",
  ]);
  const video = page.getByRole("figure").locator("video");
  await expect(video).toHaveAttribute("controls");
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.getByRole("figure")).toHaveAccessibleName(
    "A green bar slides across a dark background.",
  );
});

test("a project without media keeps the placeholder and has no clip section", async ({
  page,
}) => {
  await page.goto("/work/control-bh");
  await expect(page.getByText("Preview coming soon")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "See It in Action" }),
  ).toHaveCount(0);
});
