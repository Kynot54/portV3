import { test, expect } from "./fixtures";
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
