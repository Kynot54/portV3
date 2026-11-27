import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { getBlogPosts, getWorkList } from "../../src/lib/content/load";

/**
 * Every page to check is what the sitemap lists (samples, in e2e builds), so a
 * new page is checked as soon as it's listed; a unit test keeps every page in
 * the sitemap.
 */
async function routes(request: APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
}

/** What the loaders say should be listed (samples on), to check the sitemap itself. */
async function expectedListed() {
  return [
    "/",
    "/work",
    ...(await getWorkList()).map((e) => `/work/${e.slug}`),
    "/blog",
    ...(await getBlogPosts({ BLOG_SAMPLES: "1" })).map(
      (p) => `/blog/${p.slug}`,
    ),
    "/contact",
    "/services",
  ];
}

const meta = (page: Page, sel: string) =>
  page.locator(`head ${sel}`).first().getAttribute("content");

test.describe("head tags", () => {
  test("every route has full OG/Twitter tags", async ({
    page,
    request,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "head tags don't vary by viewport",
    );
    for (const path of await routes(request)) {
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

/** Width and height from a PNG's IHDR chunk (bytes 16–23). */
function pngSize(buf: Buffer) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test.describe("cards and crawl files", () => {
  test("each route's og:image is a 1200×630 PNG", async ({
    page,
    request,
  }, info) => {
    test.skip(info.project.name !== "desktop", "doesn't vary by viewport");
    for (const path of await routes(request)) {
      await page.goto(path);
      const src = await meta(page, 'meta[property="og:image"]');
      expect(src, path).toBeTruthy();
      const res = await request.get(
        new URL(src!).pathname + new URL(src!).search,
      );
      expect(res.status(), path).toBe(200);
      // Built with the site, not on the first crawler's request.
      expect(res.headers()["x-nextjs-cache"], path).toBe("HIT");
      expect(res.headers()["content-type"], path).toContain("image/png");
      expect(pngSize(await res.body()), path).toEqual({
        width: 1200,
        height: 630,
      });
      expect(await meta(page, 'meta[property="og:image:alt"]'), path).toMatch(
        /, Kyle Whynott$/,
      );
    }
  });

  test("robots.txt matches", async ({ request }, info) => {
    test.skip(info.project.name !== "desktop", "doesn't vary by viewport");
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("User-Agent: *");
    expect(text).toContain("Allow: /");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap: https://kwhynott.dev/sitemap.xml");
  });

  test("sitemap.xml has the expected URLs", async ({ request }, info) => {
    test.skip(info.project.name !== "desktop", "doesn't vary by viewport");
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of await expectedListed())
      expect(xml).toContain(
        `<loc>https://kwhynott.dev${path === "/" ? "/" : path}</loc>`,
      );
    expect(xml).not.toContain("/blog/none");
    expect(xml).not.toContain("/api");
  });
});

test.describe("security headers", () => {
  test("headers present on pages", async ({ request }, info) => {
    test.skip(info.project.name !== "desktop", "doesn't vary by viewport");
    for (const path of ["/", "/contact"]) {
      const h = (await request.get(path)).headers();
      for (const name of [
        "content-security-policy",
        "strict-transport-security",
        "x-content-type-options",
        "referrer-policy",
        "permissions-policy",
        "x-frame-options",
      ])
        expect(h[name], `${path} ${name}`).toBeTruthy();
      expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    }
  });
});
