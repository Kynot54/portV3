import type { Metadata } from "next";
import type { BlogPost, WorkEntry } from "@/lib/content/types";

/** The site's description: Home, link previews, search results (Kyle signs off). */
export const SITE_DESCRIPTION =
  "I'm Kyle Whynott, an AI and software engineer. I've built AI document pipelines for 50+ clients and taught machine learning at Cal State Fullerton.";

export const PAGE_DESCRIPTIONS = {
  work: "Selected projects I've built and shipped, from AI document pipelines to full-stack apps, each with its context, what I built, the result, and what I learned.",
  blog: "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended.",
  contact:
    "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days.",
};

/** LinkedIn warns under 100 characters; search results cut off around 160. */
const MIN = 100;
const MAX = 160;

/** Shortens to `max` characters at a word boundary, ending in "…" when cut. */
export function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  // Room for the ellipsis; keep the last word only if it ends exactly at the cut.
  let cut = text.slice(0, max - 1);
  if (text[max - 1] !== " ") {
    const space = cut.lastIndexOf(" ");
    if (space > 0) cut = cut.slice(0, space);
  }
  return `${cut.replace(/[\s,;:.–-]+$/, "")}…`;
}

/** A project's approved summary plus its context line, so it clears LinkedIn's minimum. */
export function describeWork(e: WorkEntry): string {
  return trimTo(`${e.summary} ${e.context}`, MAX);
}

/** First prose paragraph of an MDX body, as plain text. */
function firstParagraph(body: string): string {
  const block = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|[-*>]|\d+\.|```|---|import |export |<)/.test(b));
  return (block ?? "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** A post's summary, topped up with its first paragraph when under 100 characters. */
export function describePost(p: BlogPost): string {
  if (p.summary.length >= MIN) return trimTo(p.summary, MAX);
  return trimTo(`${p.summary} ${firstParagraph(p.body)}`.trim(), MAX);
}

/** Canonical host for every URL we advertise, whatever host serves the build. */
export const SITE_ORIGIN = "https://kwhynott.dev";

/**
 * Full metadata for one page. Next replaces (doesn't merge) a nested page's
 * openGraph object, so every page builds the whole thing here.
 */
export function pageMetadata(o: {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const url = new URL(o.path, SITE_ORIGIN).toString();
  return {
    ...(o.title ? { title: o.title } : {}),
    description: o.description,
    alternates: { canonical: url },
    openGraph: {
      title: o.title ?? "Kyle Whynott",
      description: o.description,
      url,
      siteName: "Kyle Whynott",
      locale: "en_US",
      ...(o.type === "article"
        ? { type: "article", publishedTime: o.publishedTime }
        : { type: "website" }),
    },
    twitter: { card: "summary_large_image" },
  };
}
