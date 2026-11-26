import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ContentError,
  getFeaturedWork,
  getWorkList,
  getPost,
  getPosts,
  getWork,
  getWorkEntry,
} from "@/lib/content/load";
import { HERO_PROOF } from "@/components/home/hero";
import { ABOUT_TEXT } from "@/components/home/about";

const F = resolve("tests/fixtures/content");

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
    order: 1,
    label: null,
    role: "Engineer",
    location: "Remote",
    period: "Jan 2025 – Feb 2025",
    context: "Some context.",
    impactHeading: "Result",
    impact: ["Point one."],
    learned: "Something learned.",
    tools: ["Tool"],
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
  expect(plain).toMatchObject({ featured: false, order: 9, label: null });
});

test("real featured work matches the approved cards", async () => {
  const w = await getFeaturedWork();
  expect(w.map((e) => [e.label, e.title, e.summary])).toEqual([
    [
      "AI · 2025–26",
      "AI document pipelines",
      "I built AI pipelines for 50+ clients. Manual review dropped 50%.",
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

/**
 * Every numeric claim on Home, paired with the exact resume phrase it comes from.
 * A number in Home copy that isn't inside one of these copy phrases fails the test.
 */
const CLAIMS: [copyPhrase: string, resumePhrase: string][] = [
  ["50+ clients", "over 50 clients"],
  ["Manual review dropped 50%", "manual review down by 50%"],
  ["1,000+ users", "1,000+ users"],
  ["Donations rose 40%", "donation volume by 40%"],
  ["40+ students", "40+ students"],
  ["over 60%", "accuracy by over 60%"],
  ["40% faster", "process by 40%"],
  ["Lighthouse score of 98", "Lighthouse score of 98%"],
  ["under two weeks", "under 2 weeks"],
  ["100+ applicants", "100+ applicants"],
  ["over 50%", "hiring efficiency by over 50%"],
];
/** Tool and degree names that contain digits but aren't claims. */
const EXEMPT = /GPT-\d(\.\d)?|PHP 8\.2|HTML5|CSS3|C\+\+|M\.S\./g;

test("every number on Home and work pages traces to its exact resume phrase", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  for (const [, source] of CLAIMS)
    expect(resume, `resume lacks "${source}"`).toContain(source);
  const copy = [
    ...(await getWorkList()).flatMap((e) => [
      e.summary,
      e.context,
      ...e.impact,
      e.learned,
      e.body,
    ]),
    HERO_PROOF.join(" · "),
    ABOUT_TEXT,
  ];
  for (const text of copy) {
    let rest = text.replace(EXEMPT, " ");
    for (const [phrase] of CLAIMS) rest = rest.split(phrase).join(" ");
    expect(rest.match(/\d/), `unmapped number in: ${text}`).toBeNull();
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

test("getWorkList returns all five real entries in list order", async () => {
  expect((await getWorkList()).map((e) => e.slug)).toEqual([
    "ai-document-pipelines",
    "control-bh",
    "ulti-health",
    "video-interview-plugin",
    "ai-mind-companion",
  ]);
});

test("non-placeholder entry missing context fails loudly", async () => {
  await expect(getWork(`${F}/work-no-context`)).rejects.toMatchObject({
    field: "context",
  });
});

test("impactHeading must be Result or What it does", async () => {
  await expect(getWork(`${F}/work-bad-heading`)).rejects.toMatchObject({
    field: "impactHeading",
  });
});

test("ai-mind-companion carries the approved CARL copy", async () => {
  const e = (await getWorkList()).find((w) => w.slug === "ai-mind-companion")!;
  expect(e.context).toBe(
    "An exploratory project to see what AI can do in medicine.",
  );
  expect(e.impactHeading).toBe("What it does");
  expect(e.impact).toHaveLength(1);
  expect(e.learned).toMatch(/^I learned to build a native mobile app/);
});

test("resume says over 50 clients and AI Mind Companion's new facts", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  expect(resume).toContain("for over 50 clients");
  expect(resume).not.toContain("over 10 clients");
  const amc = resume
    .slice(
      resume.indexOf("### AI Mind Companion"),
      resume.indexOf("## Education"),
    )
    .toLowerCase();
  for (const f of [
    "speech-to-text",
    "text-to-speech",
    "dementia",
    "fastapi",
    "cloud functions",
    "jsonl",
    "native mobile app",
  ])
    expect(amc, f).toContain(f);
});
