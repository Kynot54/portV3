import {
  PAGE_DESCRIPTIONS,
  SITE_DESCRIPTION,
  describePost,
  describeWork,
  trimTo,
} from "@/lib/seo";
import { getBlogPosts, getWorkList } from "@/lib/content/load";
import type { BlogPost } from "@/lib/content/types";

test("SITE_DESCRIPTION and page descriptions are the exact copy", () => {
  expect(SITE_DESCRIPTION).toBe(
    "I'm Kyle Whynott, an AI and software engineer. I build production-grade generative AI applications end to end, including AI document pipelines for 50+ clients.",
  );
  expect(PAGE_DESCRIPTIONS).toEqual({
    work: "Selected projects I've built and shipped, from AI document pipelines to full-stack apps, each with its context, what I built, the result, and what I learned.",
    blog: "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended.",
    contact:
      "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days.",
  });
});

test("trim at a word boundary", () => {
  expect(trimTo("aaa bbb ccc", 8)).toBe("aaa bbb…");
  expect(trimTo("short text", 160)).toBe("short text");
  const long = "word ".repeat(60).trim();
  expect(trimTo(long, 160).length).toBeLessThanOrEqual(160);
  expect(trimTo(long, 160).endsWith("…")).toBe(true);
});

test("describeWork uses the entry's own description when it has one", async () => {
  const [e] = await getWorkList();
  const own = "D".repeat(120);
  expect(describeWork({ ...e, description: own })).toBe(own);
});

test("describeWork falls back to summary + context, ≤ 160", async () => {
  const [first] = await getWorkList();
  const e = { ...first, description: null };
  const d = describeWork(e);
  expect(d.length).toBeLessThanOrEqual(160);
  expect(d.startsWith(e.summary)).toBe(true);
  expect(`${e.summary} ${e.context}`.startsWith(d.replace(/…$/, ""))).toBe(
    true,
  );
});

const post = (
  summary: string,
  body: string,
  description: string | null = null,
): BlogPost => ({
  slug: "p",
  title: "P",
  summary,
  description,
  date: "2026-11-26",
  tags: [],
  placeholder: false,
  draft: false,
  body,
});

test("describePost uses the post's own description when it has one", () => {
  const own = "E".repeat(130);
  expect(describePost(post("Short summary.", "Body.", own))).toBe(own);
});

test("describePost falls back to summary + first paragraph under 100", () => {
  const long = "x".repeat(100);
  expect(describePost(post(long, "Body."))).toBe(long);
  const d = describePost(
    post(
      "Short summary.",
      "## Heading\n\n- list\n\nFirst [linked](/x) *real* paragraph here.\n",
    ),
  );
  expect(d).toBe("Short summary. First linked real paragraph here.");
});

test("every live description is 100–160", async () => {
  const descriptions = [
    SITE_DESCRIPTION,
    ...Object.values(PAGE_DESCRIPTIONS),
    ...(await getWorkList()).map(describeWork),
    ...(await getBlogPosts({})).map(describePost),
  ];
  for (const d of descriptions) {
    expect(d.length, d).toBeGreaterThanOrEqual(100);
    expect(d.length, d).toBeLessThanOrEqual(160);
  }
});

import { pageMetadata } from "@/lib/seo";

test("pageMetadata builds canonical, openGraph and twitter", () => {
  const m = pageMetadata({
    title: "Work",
    description: "D".repeat(120),
    path: "/work",
  });
  expect(m.title).toBe("Work");
  expect(m.description).toBe("D".repeat(120));
  expect(m.alternates?.canonical).toBe("https://kwhynott.dev/work");
  expect(m.openGraph).toMatchObject({
    title: "Work",
    description: "D".repeat(120),
    url: "https://kwhynott.dev/work",
    siteName: "Kyle Whynott",
    type: "website",
    locale: "en_US",
  });
  expect(m.twitter).toMatchObject({ card: "summary_large_image" });
});

test("canonical is absolute on kwhynott.dev", () => {
  const before = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://portv3-git-x.vercel.app";
  try {
    const m = pageMetadata({ description: "d", path: "/" });
    expect(m.alternates?.canonical).toBe("https://kwhynott.dev/");
    expect((m.openGraph as { url: string }).url).toBe("https://kwhynott.dev/");
    expect(m.title).toBeUndefined();
    expect((m.openGraph as { title: string }).title).toBe("Kyle Whynott");
  } finally {
    process.env.NEXT_PUBLIC_SITE_URL = before;
  }
});

test("article type carries publishedTime", () => {
  const m = pageMetadata({
    title: "Post",
    description: "d",
    path: "/blog/p",
    type: "article",
    publishedTime: "2026-11-26",
  });
  expect(m.openGraph).toMatchObject({
    type: "article",
    publishedTime: "2026-11-26",
  });
});
