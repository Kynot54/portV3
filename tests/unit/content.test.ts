import {
  ContentError,
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
