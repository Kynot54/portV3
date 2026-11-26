import { readFile } from "node:fs/promises";
import {
  ContentError,
  getFeaturedWork,
  getPost,
  getPosts,
  getWork,
  getWorkEntry,
} from "@/lib/content/load";

const F = "tests/fixtures/content";

test("getWork parses frontmatter, slugs from filename, newest first", async () => {
  const work = await getWork(`${F}/work`);
  expect(work.map((w) => w.slug)).toEqual(["beta", "alpha"]);
  expect(work[0]).toEqual({
    slug: "beta",
    title: "Beta",
    summary: "Newer project.",
    date: "2026-01",
    tags: ["typescript", "nextjs"],
    placeholder: false,
    featured: false,
    order: null,
    label: null,
    body: "Beta body.\n",
  });
  expect(work[1].placeholder).toBe(false); // default
});

test("missing title throws ContentError naming file and field", async () => {
  await expect(getWork(`${F}/work-bad`)).rejects.toThrow(ContentError);
  await expect(getWork(`${F}/work-bad`)).rejects.toMatchObject({
    file: "bad.mdx",
    field: "title",
  });
});

test("invalid date format throws ContentError (field: date)", async () => {
  await expect(getWork(`${F}/work-bad-date`)).rejects.toMatchObject({
    field: "date",
  });
});

test("non-mdx files are ignored and a missing dir returns []", async () => {
  expect((await getWork(`${F}/work`)).every((w) => w.slug !== "notes")).toBe(
    true,
  );
  expect(await getWork(`${F}/does-not-exist`)).toEqual([]);
});

test("getPosts excludes drafts unless includeDrafts; blog dates are YYYY-MM-DD", async () => {
  const dir = `${F}/blog`;
  expect((await getPosts({ dir })).map((p) => p.slug)).toEqual(["one"]);
  const all = await getPosts({ dir, includeDrafts: true });
  expect(all.map((p) => p.slug)).toEqual(["two", "one"]);
  expect(all[1].date).toBe("2026-01-10");
});

test("single-entry lookups, and path-traversal slugs return null", async () => {
  expect((await getWorkEntry("alpha", `${F}/work`))?.title).toBe("Alpha");
  expect(await getWorkEntry("nope", `${F}/work`)).toBeNull();
  expect(await getPost("../secrets", { dir: `${F}/blog` })).toBeNull();
  expect(await getPost("one", { dir: `${F}/blog` })).not.toBeNull();
  expect(await getPost("two", { dir: `${F}/blog` })).toBeNull(); // draft
});

test("real content dirs load and every placeholder is marked", async () => {
  const entries = [
    ...(await getWork()),
    ...(await getPosts({ includeDrafts: true })),
  ];
  expect(entries.length).toBeGreaterThan(0);
  for (const e of entries) {
    if (e.placeholder) {
      expect(e.title).toMatch(/^Placeholder/);
      expect(e.body).toContain("TODO(kyle)");
    }
  }
});

test("an .mdx file whose name isn't a valid slug fails loudly", async () => {
  await expect(getWork(`${F}/work-bad-name`)).rejects.toMatchObject({
    file: "My-Post.mdx",
    field: "filename",
  });
});

test("getFeaturedWork returns featured, non-placeholder entries by order", async () => {
  const w = await getFeaturedWork(`${F}/work-featured`);
  expect(w.map((e) => e.slug)).toEqual(["first", "second"]);
  expect(w[0]).toMatchObject({
    featured: true,
    order: 1,
    label: "AI · 2025–26",
  });
});

test("featured entry without order fails loudly", async () => {
  await expect(
    getFeaturedWork(`${F}/work-featured-noorder`),
  ).rejects.toMatchObject({
    file: "x.mdx",
    field: "order",
  });
});

test("non-featured entries default featured=false, order=null, label=null", async () => {
  const plain = (await getWork(`${F}/work-featured`)).find(
    (e) => e.slug === "plain",
  )!;
  expect(plain).toMatchObject({ featured: false, order: null, label: null });
});

test("real featured work matches the approved cards", async () => {
  const w = await getFeaturedWork();
  expect(w.map((e) => [e.label, e.title, e.summary])).toEqual([
    [
      "AI · 2025–26",
      "AI document pipelines",
      "I built AI pipelines for 10+ clients. Manual review dropped 50%.",
    ],
    [
      "Web · 2024–25",
      "C.O.N.T.R.O.L. BH",
      "I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%.",
    ],
    [
      "AI · Mobile · 2025–26",
      "Ulti-Health",
      "I built a wellness app that plans workouts and meals from the user's own data.",
    ],
  ]);
});

test("every number in featured summaries appears in resume.md", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  for (const e of await getFeaturedWork())
    for (const n of e.summary.match(/\d[\d,]*\+?%?/g) ?? []) {
      // "10+" on a card matches "10+" or "over 10" in the resume.
      const base = n.replace(/[+%]$/, "");
      const found =
        resume.includes(n.replace(/%$/, "")) ||
        (n.endsWith("+") && resume.includes(`over ${base}`));
      expect(found, `${e.slug}: ${n} not in resume`).toBe(true);
    }
});

test("resume Ulti-Health entry uses the approved stack", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  const section = resume.slice(
    resume.indexOf("### Ulti-Health"),
    resume.indexOf("### AI Mind Companion"),
  );
  expect(section).toContain("Expo (React Native) and Supabase");
  expect(section).not.toMatch(/Kotlin|Swift|Tower|Fly\.io|GitHub Actions/);
});
