import type { Metadata } from "next";
import type { BlogPost, WorkEntry } from "@/lib/content/types";
import {
  DESCRIPTION_MAX as MAX,
  DESCRIPTION_MIN as MIN,
} from "@/lib/description-limits";

/** The site's description: Home, link previews, search results (Kyle signs off). */
export const SITE_DESCRIPTION =
  "I'm Kyle Whynott, an AI and software engineer. I build production-grade generative AI applications end to end, including AI document pipelines for 50+ clients.";

export const PAGE_DESCRIPTIONS = {
  work: "Selected projects I've built and shipped, from AI document pipelines to full-stack apps, each with its context, what I built, the result, and what I learned.",
  blog: "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended.",
  services:
    "I build websites and custom software for founders and small businesses, and I teach teams to use technology and AI. It starts with a free call.",
  contact:
    "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days.",
};

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

/** A project's own description, else its summary plus context line (clears LinkedIn's minimum). */
export function describeWork(e: WorkEntry): string {
  if (e.description) return e.description;
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

/** A post's own description, else its summary, topped up with its first paragraph when under 100. */
export function describePost(p: BlogPost): string {
  if (p.description) return p.description;
  if (p.summary.length >= MIN) return trimTo(p.summary, MAX);
  return trimTo(`${p.summary} ${firstParagraph(p.body)}`.trim(), MAX);
}

/** A card's alt: "<title>, Kyle Whynott", without the title's end punctuation (no ".,"). */
export const cardAlt = (title: string) =>
  `${title.replace(/[.!?…]+$/, "")}, Kyle Whynott`;

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
  /**
   * This page's card, for cards whose alt depends on the page (projects,
   * posts). Setting it replaces the file-based card's tags.
   */
  image?: { path: string; alt: string };
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
      ...(o.image
        ? {
            images: [
              {
                url: o.image.path,
                width: 1200,
                height: 630,
                type: "image/png",
                alt: o.image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}
