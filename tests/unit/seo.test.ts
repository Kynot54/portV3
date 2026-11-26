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
    "I'm Kyle Whynott, an AI and software engineer. I've built AI document pipelines for 50+ clients and taught machine learning at Cal State Fullerton.",
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

test("describeWork is summary + context, ≤ 160", async () => {
  const [e] = await getWorkList();
  const d = describeWork(e);
  expect(d.length).toBeLessThanOrEqual(160);
  expect(d.startsWith(e.summary)).toBe(true);
  expect(`${e.summary} ${e.context}`.startsWith(d.replace(/…$/, ""))).toBe(
    true,
  );
});

const post = (summary: string, body: string): BlogPost => ({
  slug: "p",
  title: "P",
  summary,
  date: "2026-11-26",
  tags: [],
  placeholder: false,
  draft: false,
  body,
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
