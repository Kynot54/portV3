# Slice 03: Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/work` list and five static `/work/[slug]` CARL detail pages from `content/work/*.mdx`, and point the Home cards at them.

- **Detail page:** Context, What I built, Result, What I learned, Built with, plus a placeholder media slot.
- **Rendering:** the "What I built" prose renders through `@mdx-js/mdx`.

**Architecture:**

- **The loader** gains the CARL and meta fields and an ordered `getWorkList()`.
- **The MDX body** (the Action prose) compiles at build time through one small server module.
- **A shared `WorkCard`** serves Home (h3) and `/work` (h2).
- **Detail pages:** `generateStaticParams` plus `notFound()`, with content reads cached via `"use cache"` and `cacheLife("max")`.

**Tech Stack:** The Slice 1–2 stack, plus **`@mdx-js/mdx`** (approved). No other packages.

**Spec:** `docs/superpowers/specs/2026-11-26-slice-03-work-design.md` (approved 2026-11-26).

## Approach, alternatives, risks

The `CLAUDE.md` working agreement asks for these three.

- **Approach:** content and resume → MDX renderer → cards and list → detail pages → quality pass → PR.
- **Alternatives:** the MDX options (`@next/mdx`, `next-mdx-remote`) are compared in the spec. Kyle picked `@mdx-js/mdx`.
- **Risks:**
  - **CSP:** MDX `evaluate` runs compiled code with `new Function`. That's fine at build time on the server, and the Slice 6 security policy must allow for it (server-only, so there's no client impact).
  - **Facts test:** version numbers in tool names ("GPT-4", "PHP 8.2") need explicit exemptions.
  - **Merging is a production deploy,** and it changes Home's proof line from 10+ to 50+.

## Global Constraints

- **Copy:** every project string comes **verbatim** from the spec's "The five projects" section. That covers label, title, summary, role, location, period, context, result items, What I built, What I learned and Built with. Any change is Kyle's call.
- **List order:** `ai-document-pipelines` (1), `control-bh` (2), `ulti-health` (3), `video-interview-plugin` (4), `ai-mind-companion` (5).
- **`resume.md`:** "for over 10 clients" becomes "for over 50 clients". AI Mind Companion gains Kyle's facts (see Task 1).
- **Facts:** every number on Home and the work pages maps to an exact resume phrase. Tool or version names (`GPT-4`, `GPT-3.5`, `PHP 8.2`, `HTML5`, `CSS3`, `C++`, `M.S.`) aren't claims.
- **Headings:** detail pages have an h1 title and h2 sections ("Context", "What I built", the Result heading, "What I learned", "Built with"). Card titles are h3 on Home and h2 on `/work`.
- **Result heading:** "Result", or "What it does" for `ulti-health` and `ai-mind-companion`. A one-item list renders as a paragraph.
- **Media:** a placeholder only. A 16:9 bordered box with static dim grain and the micro-label "Preview coming soon", plus `{/* TODO(kyle): screenshot or clip */}`. The decorative layer is `aria-hidden`; the label stays readable.
- **Caching and 404s:** pages are static; unknown slugs return 404; content reads use `"use cache"` + `cacheLife("max")` (Home included).
- **Slice 1–2 rules:** tokens, focus ring, 44 px targets, no horizontal scroll from 320 px up, axe zero, Lighthouse (accessibility 1.0, others ≥ 0.95, target 0.99), no console errors.
- **Environment:** run npm with `npm_config_cache=$TMPDIR/npm-cache`. Run build, e2e, LHCI and git writes outside the sandbox. Scan for `* 2*` conflict copies before each task.

## Review Focus

1. **A detail page for a slug with a typo or a case change** (`/work/Control-BH`, `/work/nope`) returns 404, never a crash. → Task 4 `unknown and mis-cased slugs return 404`.
2. **A malformed MDX body** fails the build loudly instead of rendering broken text. → Task 2 `renderMdx throws on invalid MDX`.
3. **The facts check covers the work pages,** not just Home: a changed number in any Result item fails. → Task 1 facts test over `summary`, `context`, `impact`, `learned` and the body.
4. **The placeholder at 320 px and in light mode:** no overflow, the label stays readable, and screen readers announce it once. → Task 4 e2e and screenshots.
5. **Back navigation:** "← All work" returns to `/work`, and keyboard focus is visible on it. → Task 4 e2e.

---

## File structure

```
content/work/*.mdx                     5 entries (2 new) with CARL frontmatter; body = What I built
content/source/resume.md               50 clients; AI Mind Companion facts
src/lib/content/types.ts, load.ts      new fields; getWorkList(); order required for all non-placeholder entries
src/lib/mdx.tsx                        renderMdx(source) → ReactElement (server only)
src/components/work/work-card.tsx      shared card (headingLevel prop)
src/components/work/media-placeholder.tsx
src/components/home/selected-work.tsx  uses WorkCard (h3) → /work/[slug]
src/app/work/page.tsx                  list (h1 Work, cards h2)
src/app/work/[slug]/page.tsx           detail (CARL)
src/app/page.tsx                       cacheLife("max")
src/components/home/hero.tsx           proof line "50+ clients"
lighthouserc.json                      + /work/[5 slugs]
tests/unit/{content,mdx,work}.test.*   tests/e2e/work.spec.ts
```

---

### Task 1: Content model, five entries, resume

**Files:** `src/lib/content/types.ts`, `src/lib/content/load.ts`, `content/work/*.mdx` (update 3, add `video-interview-plugin.mdx` and `ai-mind-companion.mdx`), `content/source/resume.md`, `src/components/home/hero.tsx` (the proof line), `tests/unit/content.test.ts`, the fixtures.

**Interfaces:**

- **Produces:** `WorkEntry` gains:
  - `role: string`, `location: string`, `period: string`, `context: string`, `learned: string`
  - `impactHeading: "Result" | "What it does"`
  - `impact: string[]`
- **Required:** each of these on every non-placeholder entry, plus `order` (for all entries now, not just featured).
- **New function:** `getWorkList(dir?): Promise<WorkEntry[]>` returns non-placeholder entries sorted by `order`.
- **Unchanged:** `getFeaturedWork` behaves as before.

- [ ] **Step 1: Write the failing tests.**

```ts
test("getWorkList returns all five real entries in list order", async () => {
  expect((await getWorkList()).map((e) => e.slug)).toEqual([
    "ai-document-pipelines", "control-bh", "ulti-health", "video-interview-plugin", "ai-mind-companion",
  ]);
});
test("non-placeholder entry missing context fails loudly", ...)        // fixture → ContentError field "context"
test("impactHeading must be Result or What it does", ...)            // fixture "Impact" → ContentError field "impactHeading"
test("ai-mind-companion carries the approved CARL copy", async () => {
  const e = (await getWorkList()).find((w) => w.slug === "ai-mind-companion")!;
  expect(e.context).toBe("An exploratory project to see what AI can do in medicine.");
  expect(e.impactHeading).toBe("What it does");
  expect(e.impact).toHaveLength(1);
  expect(e.learned).toMatch(/^I learned to build a native mobile app/);
});
test("every number on Home and work pages traces to its exact resume phrase", ...)
// Extend the Slice 2 CLAIMS table. Scan: summaries, context, impact[], learned, body of every list entry, HERO_PROOF, ABOUT_TEXT.
// Strip exempt names first: /GPT-\d(\.\d)?|PHP 8\.2|HTML5|CSS3|C\+\+|M\.S\./
// Claims to add (copy phrase → resume phrase):
//   "50+ clients"→"over 50 clients", "Used by 50+ clients"→"over 50 clients", "over 60%"→"accuracy by over 60%",
//   "40% faster"→"process by 40%", "Lighthouse score of 98"→"Lighthouse score of 98%",
//   "under two weeks"→"under 2 weeks", "hundreds of financial applications"→"hundreds of daily financial applications",
//   "100+ applicants"→"100+ applicants", "over 50%"→"hiring efficiency by over 50%",
//   "Hundreds of management hours"→"100s of working hours", "thousands of dollars"→"$1,000s"
// (Words without digits pass on their own; they're listed so the mapping is reviewable in one place.)
test("resume says over 50 clients and AI Mind Companion's new facts", async () => {
  expect(resume).toContain("for over 50 clients");
  expect(resume).not.toContain("over 10 clients");
  const amc = section(resume, "### AI Mind Companion");
  for (const f of ["speech-to-text", "text-to-speech", "dementia", "FastAPI", "Cloud Functions", "JSONL", "native mobile app"])
    expect(amc.toLowerCase()).toContain(f.toLowerCase());
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Loader:** parse and validate the new fields (reuse `str`, and add a `strList` reader). Make `order` required for every non-placeholder entry. Add `getWorkList`.
  - **Entries:** write and update the five `.mdx` files with the spec's copy verbatim. The frontmatter holds the CARL fields; the body holds the "What I built" text.
  - **Resume:** apply the edits.
    - Replace "over 10" with "over 50".
    - Add AI Mind Companion bullets: "Voice assistant: speech-to-text input, text-to-speech replies; classification flags possible early signs of dementia" and "Native mobile app with a FastAPI backend on Google Cloud Run and Cloud Functions; vector store in JSONL". Note both as Kyle's facts in the header comment.
  - **Home:** the proof line `HERO_PROOF[1]` becomes "AI pipelines for 50+ clients". The `ai-document-pipelines` summary uses 50+. Update the Slice 2 tests that pinned "10+".
- [ ] **Step 4:** Run `npm test`, then `npm run build`. Expected: PASS and exit 0.
- [ ] **Step 5: Commit.** `feat(content): CARL work model, five entries, resume to 50+ clients`

---

### Task 2: MDX renderer

**Files:** `package.json` (`@mdx-js/mdx`), `src/lib/mdx.tsx`, `tests/unit/mdx.test.tsx`

**Interfaces:**

- **Produces:** `renderMdx(source: string): Promise<React.ReactElement>`, server-only.
  - It uses `evaluate(source, { ...runtime })` from `@mdx-js/mdx` with `react/jsx-runtime`.
  - It maps `a` to `<a className="link">` (external links get `rel="noopener"`), and `p`, `ul` and `li` to design-system styles.
  - Raw HTML in MDX isn't enabled; the defaults treat it as JSX only.

- [ ] **Step 1: Write the failing tests.**

```tsx
test("renders paragraphs and styled links", async () => {
  render(await renderMdx("Hello [site](https://example.com)."));
  expect(screen.getByText(/Hello/).tagName).toBe("P");
  expect(screen.getByRole("link", { name: "site" })).toHaveClass("link");
});
test("renderMdx throws on invalid MDX", async () => {
  await expect(renderMdx("<Unclosed")).rejects.toThrow();
});
test("every real work body renders", async () => {
  for (const e of await getWorkList())
    expect(await renderMdx(e.body)).toBeTruthy();
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Run `npm i @mdx-js/mdx` (no `--force`). Implement `renderMdx`.
- [ ] **Step 4:** Run `npm test` and `npm run build`. Expected: PASS and exit 0.
- [ ] **Step 5: Commit.** `feat(mdx): server-side MDX renderer (@mdx-js/mdx)`

---

### Task 3: Shared card, `/work` list, Home links

**Files:** `src/components/work/work-card.tsx`, `src/components/home/selected-work.tsx`, `src/app/work/page.tsx`, `src/app/page.tsx`, `tests/unit/work.test.tsx`, `tests/unit/home.test.tsx`

**Interfaces:**

- **Consumes:** `WorkEntry` and `getWorkList` (Task 1).
- **Produces:** `WorkCard({ entry, headingLevel }: { entry: WorkEntry; headingLevel: 2 | 3 }): JSX.Element`, which links to `/work/${entry.slug}`.

- [ ] **Step 1: Write the failing tests.**
  - **Home:** each card links to `/work/<slug>` (update the Slice 2 assertion that expected `/work`), and titles stay h3.
  - **`/work`** (render the async page): there's an h1 "Work"; there are 5 links in list order; titles are h2; and it uses `role="list"`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Cards:** extract `WorkCard` from `selected-work.tsx` with no visual change.
  - **`/work`:** the page uses a cached `getWorkList` wrapper (`"use cache"` + `cacheLife("max")`), with metadata title "Work".
  - **Home:** `featuredWork()` gains `cacheLife("max")`.
  - **Placeholder:** remove the Slice 1 placeholder text from `/work`.
- [ ] **Step 4:** Run `npm test` and `npm run build`. Expected: PASS, and `/work` is static.
- [ ] **Step 5: Commit.** `feat(work): shared card, /work list, Home cards link to project pages`

---

### Task 4: Detail pages (CARL) and the media placeholder

**Files:** `src/app/work/[slug]/page.tsx`, `src/components/work/media-placeholder.tsx`, `tests/unit/work.test.tsx`, `tests/e2e/work.spec.ts`

**Interfaces:**

- **Consumes:** `getWorkList`, `renderMdx`.
- **Produces:**
  - `generateStaticParams(): { slug: string }[]`, covering the 5 slugs.
  - `generateMetadata({ params })`: title is the entry title, description is the summary.
  - `MediaPlaceholder(): JSX.Element`.

- [ ] **Step 1: Write the failing tests.**

Unit (`MediaPlaceholder`): it shows the text "Preview coming soon", the decorative layer is `aria-hidden`, and nothing is focusable.

E2e (`tests/e2e/work.spec.ts`):

```ts
for (const slug of SLUGS) test(`${slug}: CARL sections in order with approved copy`, ...)
// h1 = title; h2s = ["Context","What I built", RESULT_HEADING[slug], "What I learned","Built with"]; Built with items = spec tools; meta line has role · location · period
test("ai-mind-companion's single What it does item renders as a paragraph", ...)
test("unknown and mis-cased slugs return 404", ...)        // /work/nope, /work/Control-BH
test("Home cards and /work cards open the matching detail page", ...)
test("← All work returns to /work with visible focus", ...)
test("placeholder fits at 320px and stays readable in light mode", ...) // no horizontal scroll; label color contrast ≥ 4.5 via computed style
```

- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **The page:** `max-w-3xl px-gutter py-section`, with "← All work" (`link` style, `/work`), the micro-label, the h1, and the muted summary.
  - **The placeholder:** 16:9 with `rounded-xl border`. The grain uses `.three-eras::before`-style dots (static) on an `aria-hidden` layer, with a centred `micro-label` "Preview coming soon".
  - **The sections:** h2 sections in the CARL order. The Result renders as a `<ul>`, or a `<p>` when it has one item. "What I built" is `await renderMdx(entry.body)`. "Built with" is a `<ul role="list">` of quiet grey tags. The meta line is muted.
  - **Unknown slugs:** `notFound()` for any slug that isn't in the list.
- [ ] **Step 4:** Run `npm test`, `npm run build` (expect 5 `/work/[slug]` paths) and `npx playwright test tests/e2e/work.spec.ts`. Expected: PASS.
- [ ] **Step 5:** Take screenshots of one detail page (dark, light, 375, 1440) into the scratchpad, look at them, and fix anything that looks unfinished.
- [ ] **Step 6: Commit.** `feat(work): CARL project pages with media placeholder`

---

### Task 5: Quality pass

- [ ] **Step 1:** Add the 5 detail URLs to `lighthouserc.json`'s `collect.url`.
- [ ] **Step 2:** Run the full suite: lint, format, typecheck, unit, e2e, then `npm run lhci`. Expected: all green, axe zero on `/work` and all detail pages (add them to `a11y.spec.ts`'s routes), and Lighthouse accessibility 1.0 with the rest ≥ 0.95 (target 0.99).
- [ ] **Step 3:** Run e2e twice more and `work.spec.ts --repeat-each=10`. Expected: no flakes.
- [ ] **Step 4:** Do a keyboard pass on `/work` and one detail page, and save screenshots to `docs/plans/slice-03-screens/` for the PR.
- [ ] **Step 5: Commit** the screenshots and any fixes, each fix with its test.

---

### Task 6: PR

- [ ] **Step 1:** Write `docs/plans/slice-03-pr.md` covering:
  - **⚠️ Merging deploys to production,** including Home's 10+ → 50+ change.
  - the summary, the preview URL (`portv3-git-slice-03-work-kynot54s-projects.vercel.app`) and the screenshots
  - the evidence
  - the `TODO(kyle)` list (5 media slots)
  - "Needs Kyle's call"
  - "Conflicts flagged"
  - the deferred minors
- [ ] **Step 2:** Push, then run `gh pr create --base main --head slice/03-work --title "Slice 03: Work" --body-file docs/plans/slice-03-pr.md`. Expected: a PR URL, and CI plus Vercel green.
- [ ] **Step 3:** Run the whole-branch review (fresh reviewer). Fix Critical and Important findings with tests, and list the minors.
- [ ] **Step 4:** Update `docs/plans/CHECKPOINT.md`, then commit and push.

## Self-review notes

- **Spec coverage:**
  - CARL fields and copy (1), MDX (2), list and cards and heading levels (3), detail pages, placeholder, 404s and the one-item rule (4)
  - Home's 50+ change (1) and Home cards → detail (3)
  - `cacheLife` (3, 4), facts (1), Lighthouse and axe on the new routes (5), the live-deploy note (6)
- **Names:** `getWorkList`, `renderMdx`, `WorkCard`, `headingLevel`, `MediaPlaceholder`, `impactHeading` and `impact` are used the same way in every task.
