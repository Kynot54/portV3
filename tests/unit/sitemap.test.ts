import { buildSitemap } from "@/app/sitemap";
import type { BlogPost } from "@/lib/content/types";

const post = (slug: string, date: string): BlogPost => ({
  slug,
  title: slug,
  summary: "s",
  description: null,
  date,
  tags: [],
  placeholder: false,
  draft: false,
  body: "",
});
const work = [{ slug: "alpha" }, { slug: "beta" }];
const urls = (m: ReturnType<typeof buildSitemap>) => m.map((e) => e.url);

test("sitemap lists home, work, projects, contact", () => {
  expect(urls(buildSitemap({ work, posts: [], services: false }))).toEqual([
    "https://kwhynott.dev/",
    "https://kwhynott.dev/work",
    "https://kwhynott.dev/work/alpha",
    "https://kwhynott.dev/work/beta",
    "https://kwhynott.dev/contact",
  ]);
});

test("sitemap omits blog with no posts", () => {
  const u = urls(buildSitemap({ work, posts: [], services: false }));
  expect(u.some((x) => x.includes("/blog"))).toBe(false);
});

test("sitemap lists blog and posts with lastModified when posts exist", () => {
  const m = buildSitemap({
    work: [],
    posts: [post("first", "2026-11-26"), post("second", "2026-11-20")],
    services: false,
  });
  expect(urls(m)).toContain("https://kwhynott.dev/blog");
  expect(m.find((e) => e.url.endsWith("/blog/first"))?.lastModified).toBe(
    "2026-11-26",
  );
  expect(m.find((e) => e.url.endsWith("/blog/second"))?.lastModified).toBe(
    "2026-11-20",
  );
});

test("services only when enabled", () => {
  expect(
    urls(buildSitemap({ work, posts: [], services: false })),
  ).not.toContain("https://kwhynott.dev/services");
  expect(urls(buildSitemap({ work, posts: [], services: true }))).toContain(
    "https://kwhynott.dev/services",
  );
});

test("never lists /blog/none or /api", () => {
  const u = urls(
    buildSitemap({ work, posts: [post("a", "2026-01-01")], services: true }),
  );
  expect(u.some((x) => x.endsWith("/blog/none") || x.includes("/api"))).toBe(
    false,
  );
});
