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

const resolve = (dir: string) =>
  isAbsolute(dir) ? dir : join(process.cwd(), dir);

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

function toWork(r: Raw): WorkEntry {
  return {
    slug: r.slug,
    title: str(r, "title"),
    summary: str(r, "summary"),
    date: date(r, MONTH, "YYYY-MM"),
    tags: tags(r),
    placeholder: bool(r, "placeholder"),
    body: r.body,
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
