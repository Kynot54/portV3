import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { getBlogPosts, getWorkList } from "../../src/lib/content/load";

/** Every page that exists in e2e builds (samples on). */
async function routes() {
  return [
    "/",
    "/work",
    ...(await getWorkList()).map((e) => `/work/${e.slug}`),
    "/blog",
    ...(await getBlogPosts({ BLOG_SAMPLES: "1" })).map(
      (p) => `/blog/${p.slug}`,
    ),
    "/contact",
  ];
}

const meta = (page: Page, sel: string) =>
  page.locator(`head ${sel}`).first().getAttribute("content");

test.describe("head tags", () => {
  test("every route has full OG/Twitter tags", async ({ page }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "head tags don't vary by viewport",
    );
    for (const path of await routes()) {
      await page.goto(path);
      const description = await meta(page, 'meta[name="description"]');
      expect(description?.length ?? 0, path).toBeGreaterThanOrEqual(100);
      // Next writes the root as "https://kwhynott.dev" (no slash); both are the same URL.
      const abs = new RegExp(
        `^https://kwhynott\\.dev${path === "/" ? "/?" : path}$`,
      );
      await expect(
        page.locator('head link[rel="canonical"]'),
        path,
      ).toHaveAttribute("href", abs);
      expect(await meta(page, 'meta[property="og:title"]'), path).toBeTruthy();
      expect(await meta(page, 'meta[property="og:description"]'), path).toBe(
        description,
      );
      expect(await meta(page, 'meta[property="og:url"]'), path).toMatch(abs);
      expect(await meta(page, 'meta[property="og:site_name"]'), path).toBe(
        "Kyle Whynott",
      );
      expect(await meta(page, 'meta[property="og:type"]'), path).toBe(
        path.startsWith("/blog/") ? "article" : "website",
      );
      expect(await meta(page, 'meta[name="twitter:card"]'), path).toBe(
        "summary_large_image",
      );
    }
  });
});
