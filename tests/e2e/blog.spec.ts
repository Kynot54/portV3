import type { Page } from "@playwright/test";
import { test, expect, isMobile } from "./fixtures";
import { getBlogPosts } from "../../src/lib/content/load";
import { formatDate } from "../../src/lib/format-date";

const samples = () => getBlogPosts({ BLOG_SAMPLES: "1" });

test.describe("post page", () => {
  test("every sample post page renders title, date, tags, body", async ({
    page,
  }) => {
    for (const p of await samples()) {
      const res = await page.goto(`/blog/${p.slug}`);
      expect(res?.status(), p.slug).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title);
      await expect(page).toHaveTitle(new RegExp(p.title));
      const time = page.locator(`main time[datetime="${p.date}"]`);
      await expect(time).toHaveText(formatDate(p.date));
      await expect(
        page.getByRole("list", { name: "Tags" }).getByRole("listitem"),
      ).toHaveText(p.tags);
      await expect(page.locator("main p").first()).toBeVisible();
    }
  });

  test("post headings start at h2", async ({ page }) => {
    await page.goto("/blog/sample-formatting");
    await expect(
      page.getByRole("heading", { level: 2, name: "A second-level heading" }),
    ).toBeVisible();
  });

  test.describe("unknown slugs", () => {
    test.use({ allowedConsole: [/status of 404/] });
    test("unknown slug returns 404", async ({ page }) => {
      for (const path of ["/blog/nope", "/blog/none"]) {
        const res = await page.goto(path);
        expect(res?.status(), path).toBe(404);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Page not found",
        );
      }
    });
  });

  test("← All posts returns to /blog", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit skips links on Tab by default");
    await page.goto("/blog/sample-short-note");
    const back = page.getByRole("link", { name: "All posts", exact: true });
    await back.focus();
    expect(
      await back.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(page).toHaveURL(/\/blog$/);
  });
});

const entry = (page: Page, slug: string) => page.locator(`li#${slug}`);
const outer = (page: Page, slug: string) =>
  entry(page, slug).locator("details[data-entry]");
const body = (page: Page, slug: string) =>
  entry(page, slug).locator(".blog-entry-body p").first();
/** The summary text is rendered once per breakpoint; only one copy shows. */
const summaryText = (page: Page, slug: string, text: string) =>
  entry(page, slug).getByText(text, { exact: true }).locator("visible=true");
const readFull = (page: Page, slug: string) =>
  entry(page, slug).locator("details[data-inner] > summary");
/** A real click at the title's position; the row overlay takes it, as for a user. */
const tapTitle = (page: Page, slug: string) =>
  entry(page, slug).getByRole("heading", { level: 2 }).click({ force: true });

test.describe("blog list", () => {
  test("lists published samples newest first", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
    const titles = (await samples()).map((p) => p.title);
    await expect(page.locator("main h2")).toHaveText(titles);
  });

  test("desktop: collapsed row shows title, date, summary, tags; one click opens the full post", async ({
    page,
  }) => {
    test.skip(isMobile(page), "desktop and tablet");
    const [p] = (await samples()).filter((s) => s.slug === "sample-short-note");
    await page.goto("/blog");
    const li = entry(page, p.slug);
    await expect(summaryText(page, p.slug, p.summary)).toHaveCount(1);
    await expect(
      li.locator(`time[datetime="${p.date}"]`).locator("visible=true"),
    ).toHaveCount(1);
    await expect(
      li
        .getByRole("list", { name: "Tags" })
        .locator("visible=true")
        .getByRole("listitem"),
    ).toHaveText(p.tags);
    await expect(body(page, p.slug)).toBeHidden();
    await summaryText(page, p.slug, p.summary).click({ force: true });
    await expect(body(page, p.slug)).toBeVisible();
    await tapTitle(page, p.slug);
    await expect(body(page, p.slug)).toBeHidden();
    await expect(outer(page, p.slug)).not.toHaveAttribute("open");
  });

  test("mobile: first tap shows details, second shows the post", async ({
    page,
  }) => {
    test.skip(!isMobile(page), "phones only");
    const [p] = (await samples()).filter((s) => s.slug === "sample-short-note");
    await page.goto("/blog");
    await expect(summaryText(page, p.slug, p.summary)).toHaveCount(0);
    await tapTitle(page, p.slug);
    await expect(summaryText(page, p.slug, p.summary)).toHaveCount(1);
    await expect(body(page, p.slug)).toBeHidden();
    await readFull(page, p.slug).click();
    await expect(body(page, p.slug)).toBeVisible();
    await tapTitle(page, p.slug);
    await expect(outer(page, p.slug)).not.toHaveAttribute("open");
    await expect(summaryText(page, p.slug, p.summary)).toHaveCount(0);
  });

  test("entries open independently", async ({ page }) => {
    await page.goto("/blog");
    await tapTitle(page, "sample-short-note");
    await tapTitle(page, "sample-formatting");
    await expect(outer(page, "sample-short-note")).toHaveAttribute("open", "");
    await expect(outer(page, "sample-formatting")).toHaveAttribute("open", "");
  });

  test("row toggle is named by the title and announces state", async ({
    page,
  }) => {
    await page.goto("/blog");
    const toggle = entry(page, "sample-short-note").locator("summary").first();
    await expect(toggle).toHaveAccessibleName("Sample: A short note");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(outer(page, "sample-short-note")).toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(outer(page, "sample-short-note")).not.toHaveAttribute("open");
  });

  test("inline post headings sit under the entry title", async ({ page }) => {
    await page.goto("/blog");
    await tapTitle(page, "sample-formatting");
    if (isMobile(page)) await readFull(page, "sample-formatting").click();
    await expect(
      entry(page, "sample-formatting").getByRole("heading", {
        level: 3,
        name: "A second-level heading",
      }),
    ).toBeVisible();
  });

  test("no-JS: rows open natively and Collapse is hidden", async ({
    browser,
  }, info) => {
    const viewport = info.project.use.viewport ?? { width: 1440, height: 900 };
    const ctx = await browser.newContext({
      javaScriptEnabled: false,
      viewport,
    });
    const page = await ctx.newPage();
    await page.goto("/blog");
    await tapTitle(page, "sample-short-note");
    if (viewport.width < 640) await readFull(page, "sample-short-note").click();
    await expect(body(page, "sample-short-note")).toBeVisible();
    await expect(
      entry(page, "sample-short-note").getByRole("button", {
        name: "Collapse",
      }),
    ).toBeHidden();
    await ctx.close();
  });

  test("320px: no page overflow with a wide code block", async ({
    browser,
  }, info) => {
    test.skip(info.project.name !== "desktop", "viewport set explicitly");
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 700 },
    });
    const page = await ctx.newPage();
    await page.goto("/blog");
    await tapTitle(page, "sample-formatting");
    await readFull(page, "sample-formatting").click();
    const pre = entry(page, "sample-formatting").locator("pre");
    await expect(pre).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(await pre.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
    await ctx.close();
  });
});

test.describe("list behaviour", () => {
  test("closing resets the inner level", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("/blog");
    await tapTitle(page, "sample-short-note");
    await readFull(page, "sample-short-note").click();
    await expect(body(page, "sample-short-note")).toBeVisible();
    await tapTitle(page, "sample-short-note");
    await expect(outer(page, "sample-short-note")).not.toHaveAttribute("open");
    await tapTitle(page, "sample-short-note");
    await expect(body(page, "sample-short-note")).toBeHidden();
    await expect(
      entry(page, "sample-short-note").locator("details[data-inner]"),
    ).not.toHaveAttribute("open");
  });

  test("Collapse returns to the row", async ({ page }) => {
    await page.goto("/blog");
    await tapTitle(page, "sample-long-read");
    if (isMobile(page)) await readFull(page, "sample-long-read").click();
    const collapse = entry(page, "sample-long-read").getByRole("button", {
      name: "Collapse",
    });
    await collapse.scrollIntoViewIfNeeded();
    await collapse.click();
    await expect(outer(page, "sample-long-read")).not.toHaveAttribute("open");
    const top = await entry(page, "sample-long-read").evaluate(
      (el) => el.getBoundingClientRect().top,
    );
    const height = await page.evaluate(() => innerHeight);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(height);
    expect(
      await page.evaluate(
        () =>
          document.activeElement ===
          document.querySelector("#sample-long-read summary"),
      ),
    ).toBe(true);
  });

  test("opening sets #slug, closing clears it", async ({ page }) => {
    await page.goto("/blog");
    const before = await page.evaluate(() => history.length);
    await tapTitle(page, "sample-short-note");
    await expect(page).toHaveURL(/\/blog#sample-short-note$/);
    await tapTitle(page, "sample-short-note");
    await expect(page).toHaveURL(/\/blog$/);
    expect(await page.evaluate(() => history.length)).toBe(before);
  });

  test("/blog#sample-long-read opens that entry fully and in view", async ({
    page,
  }) => {
    await page.goto("/blog#sample-long-read");
    await expect(outer(page, "sample-long-read")).toHaveAttribute("open", "");
    await expect(body(page, "sample-long-read")).toBeVisible();
    await expect(
      entry(page, "sample-long-read").getByRole("heading", { level: 2 }),
    ).toBeInViewport();
  });

  test("unknown hash is ignored", async ({ page }) => {
    for (const hash of ["#nope", "#%22%5Dx"]) {
      await page.goto(`/blog${hash}`);
      await expect(page.locator("details[data-entry][open]")).toHaveCount(0);
    }
  });
});
