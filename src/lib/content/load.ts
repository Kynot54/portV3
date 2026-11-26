import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import matter from "gray-matter";
import type { BlogPost, WorkEntry } from "./types";

export type { BlogPost, WorkEntry } from "./types";

/** Invalid frontmatter in a content file. */
export class ContentError extends Error {
  constructor(
    readonly file: string,
    readonly field: string,
    problem: string,
  ) {
    super(`${file}: "${field}" ${problem}`);
    this.name = "ContentError";
  }
}

const SLUG = /^[a-z0-9-]+$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

type Raw = {
  file: string;
  slug: string;
  data: Record<string, unknown>;
  body: string;
};

// Paths are scoped to content/ so the deploy only traces content files, not the
// whole project. Tests pass absolute paths to their fixtures.
const resolve = (dir: string) =>
  isAbsolute(dir)
    ? dir
    : join(process.cwd(), "content", dir.replace(/^content\//, ""));

async function readEntries(dir: string): Promise<Raw[]> {
  let names: string[];
  try {
    names = await readdir(resolve(dir));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  const files = names.filter((n) => n.endsWith(".mdx"));
  // A misnamed file would otherwise vanish from the site silently.
  for (const n of files) {
    if (!SLUG.test(n.slice(0, -4)))
      throw new ContentError(
        n,
        "filename",
        "must be lowercase letters, digits and hyphens",
      );
  }
  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await readFile(join(resolve(dir), file), "utf8"),
      );
      return { file, slug: file.slice(0, -4), data, body: content };
    }),
  );
}

function str(r: Raw, field: string): string {
  const v = r.data[field];
  if (typeof v !== "string" || v.trim() === "")
    throw new ContentError(r.file, field, "must be a non-empty string");
  return v;
}

function date(r: Raw, pattern: RegExp, shape: string): string {
  let v = r.data.date;
  // YAML turns unquoted YYYY-MM-DD into a Date.
  if (v instanceof Date) v = v.toISOString().slice(0, 10);
  if (typeof v !== "string" || !pattern.test(v))
    throw new ContentError(r.file, "date", `must be ${shape}`);
  return v;
}

function tags(r: Raw): string[] {
  const v = r.data.tags ?? [];
  if (!Array.isArray(v) || !v.every((t) => typeof t === "string"))
    throw new ContentError(r.file, "tags", "must be a list of strings");
  return v;
}

function bool(r: Raw, field: string): boolean {
  const v = r.data[field] ?? false;
  if (typeof v !== "boolean")
    throw new ContentError(r.file, field, "must be true or false");
  return v;
}

const newestFirst = <T extends { date: string; slug: string }>(a: T, b: T) =>
  b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);

function optNum(r: Raw, field: string): number | null {
  const v = r.data[field];
  if (v === undefined || v === null) return null;
  if (typeof v !== "number" || !Number.isFinite(v))
    throw new ContentError(r.file, field, "must be a number");
  return v;
}

function optStr(r: Raw, field: string): string | null {
  const v = r.data[field];
  if (v === undefined || v === null) return null;
  if (typeof v !== "string" || v.trim() === "")
    throw new ContentError(r.file, field, "must be a non-empty string");
  return v;
}

function strList(r: Raw, field: string): string[] {
  const v = r.data[field];
  if (
    !Array.isArray(v) ||
    v.length === 0 ||
    !v.every((t) => typeof t === "string" && t.trim() !== "")
  )
    throw new ContentError(
      r.file,
      field,
      "must be a non-empty list of strings",
    );
  return v;
}

const HEADINGS = ["Result", "What it does"] as const;

function heading(r: Raw): WorkEntry["impactHeading"] {
  const v = r.data.impactHeading;
  if (!HEADINGS.includes(v as (typeof HEADINGS)[number]))
    throw new ContentError(
      r.file,
      "impactHeading",
      `must be one of ${HEADINGS.join(", ")}`,
    );
  return v as WorkEntry["impactHeading"];
}

function toWork(r: Raw): WorkEntry {
  const featured = bool(r, "featured");
  const order = optNum(r, "order");
  const label = optStr(r, "label");
  if (featured && order === null)
    throw new ContentError(r.file, "order", "is required when featured");
  if (featured && label === null)
    throw new ContentError(r.file, "label", "is required when featured");
  const placeholder = bool(r, "placeholder");
  const base = {
    slug: r.slug,
    title: str(r, "title"),
    summary: str(r, "summary"),
    date: date(r, MONTH, "YYYY-MM"),
    tags: tags(r),
    placeholder,
    featured,
    order,
    label,
    body: r.body,
  };
  if (placeholder) {
    // Stand-in entries are never shown; CARL fields are optional for them.
    return {
      ...base,
      role: "",
      location: "",
      period: "",
      context: "",
      impactHeading: "Result",
      impact: [],
      learned: "",
      tools: [],
    };
  }
  if (order === null)
    throw new ContentError(r.file, "order", "is required (list position)");
  if (label === null)
    throw new ContentError(r.file, "label", "is required (card micro-label)");
  return {
    ...base,
    role: str(r, "role"),
    location: str(r, "location"),
    period: str(r, "period"),
    context: str(r, "context"),
    impactHeading: heading(r),
    impact: strList(r, "impact"),
    learned: str(r, "learned"),
    tools: strList(r, "tools"),
  };
}

function toPost(r: Raw): BlogPost {
  return {
    slug: r.slug,
    title: str(r, "title"),
    summary: str(r, "summary"),
    date: date(r, DAY, "YYYY-MM-DD"),
    tags: tags(r),
    placeholder: bool(r, "placeholder"),
    draft: bool(r, "draft"),
    body: r.body,
  };
}

export async function getWork(dir = "content/work"): Promise<WorkEntry[]> {
  return (await readEntries(dir)).map(toWork).sort(newestFirst);
}

/** Entries for Home's Selected work: featured, not placeholders, by `order`. */
export async function getFeaturedWork(
  dir = "content/work",
): Promise<WorkEntry[]> {
  return (await getWork(dir))
    .filter((w) => w.featured && !w.placeholder)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Every real entry, in list order (`order` ascending). */
export async function getWorkList(dir = "content/work"): Promise<WorkEntry[]> {
  return (await getWork(dir))
    .filter((w) => !w.placeholder)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getWorkEntry(
  slug: string,
  dir = "content/work",
): Promise<WorkEntry | null> {
  if (!SLUG.test(slug)) return null;
  return (await getWork(dir)).find((w) => w.slug === slug) ?? null;
}

export async function getPosts(
  opts: { dir?: string; includeDrafts?: boolean } = {},
): Promise<BlogPost[]> {
  const posts = (await readEntries(opts.dir ?? "content/blog"))
    .map(toPost)
    .sort(newestFirst);
  return opts.includeDrafts ? posts : posts.filter((p) => !p.draft);
}

export async function getPost(
  slug: string,
  opts: { dir?: string; includeDrafts?: boolean } = {},
): Promise<BlogPost | null> {
  if (!SLUG.test(slug)) return null;
  return (await getPosts(opts)).find((p) => p.slug === slug) ?? null;
}

/** Slugs that would collide with ids the layout already uses, or the empty-blog sentinel. */
export const RESERVED_SLUGS = ["main", "mobile-menu", "none"];

export type BlogEnv = { BLOG_SAMPLES?: string; VERCEL_ENV?: string };

const published = (posts: BlogPost[]) =>
  posts.filter((p) => !p.draft && !p.placeholder);

/**
 * The posts the site shows, newest first. The one entry point for pages, the
 * layout and the nav, so a later admin only has to change this loader.
 * - BLOG_SAMPLES=1: the sample posts only (e2e, Lighthouse, local).
 * - Vercel preview: the samples while no real post is published.
 * - Otherwise (production): real published posts only.
 */
export async function getBlogPosts(
  env: BlogEnv = process.env,
  dirs: { real?: string; samples?: string } = {},
): Promise<BlogPost[]> {
  const load = async (dir: string) => {
    const posts = published(await getPosts({ dir }));
    for (const p of posts)
      if (RESERVED_SLUGS.includes(p.slug))
        throw new ContentError(`${p.slug}.mdx`, "filename", "is reserved");
    return posts;
  };
  const samples = () => load(dirs.samples ?? "content/samples/blog");
  if (env.BLOG_SAMPLES === "1") return samples();
  const real = await load(dirs.real ?? "content/blog");
  if (real.length === 0 && env.VERCEL_ENV === "preview") return samples();
  return real;
}
