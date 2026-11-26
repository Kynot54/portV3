# Slice 04: Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public Blog: a `/blog` list that expands posts in place, static `/blog/[slug]` pages, and hash deep links. The Blog stays hidden (no nav link, real 404s) until a published post exists.

**Architecture:**

- **One loader entry point, `getBlogPosts(env)`.** It picks real posts or the sample posts and returns only published ones. Every page, the layout and the nav go through it, which keeps the V3.1 admin to a loader-only change.
- **Static pages.** They wrap it in `"use cache"` + `cacheLife("max")`. The layout passes `showBlog` into the client `Header`.
- **The list is native `<details>`**, with CSS for the two-level phone and one-level desktop behaviour. One small client controller handles the inner-level reset, the Collapse button and hash sync.

**Tech Stack:** The Slice 1–3 stack (Next 16.4.6 Cache Components, React 19.3, Tailwind 4, `@mdx-js/mdx`, lucide-react, Vitest, Playwright + axe, LHCI). **No new packages.**

**Spec:** `docs/superpowers/specs/2026-11-26-slice-04-blog-design.md` (approved 2026-11-26).

## Approach, alternatives, risks

- **Approach:** loader and samples → MDX elements → nav gating → post page → list markup → list behaviour → quality pass and PR.
- **Alternatives:** listed in the spec's Approaches table (Kyle chose hide-until-first-post and native `<details>`).
- **Risks:**
  - **Empty `generateStaticParams` is a build error** under Cache Components (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md:311`, and `ensureStatic` needs ≥ 1 param). With zero posts, return the sentinel `[{ slug: "none" }]`. No post matches it, so it prerenders as a 404.
  - **Element ids.** A post slug equal to an existing page id (`main`, `mobile-menu`) would collide with the hash target. The loader rejects reserved slugs.
  - **The production-hidden state isn't exercised by e2e.** Task 7 adds a local production build with no samples, checked by hand.
  - **Merging is a production deploy.** With no real posts, the nav on kwhynott.dev becomes Work, Contact. That's intended and flagged in the PR.

## Global Constraints

- **Visible copy** (exact):
  - "Read full post"
  - "Collapse"
  - "← All posts" (the arrow is `aria-hidden`, so the link name is "All posts")
  - list heading "Blog"
- **Date display:** `Nov 26, 2026` inside `<time dateTime="2026-11-26">`. Never shifted by timezone.
- **Breakpoint:** 640 px (`sm`). Below it, phones get two levels. At 640 px and up (tablet and desktop), one level.
- **Published post:** `draft !== true && placeholder !== true`. Only published posts render, count toward "has posts", or get pages.
- **Samples:**
  - **Location:** `content/samples/blog/*.mdx`. Titles start with "Sample:", and each body says it's a sample. No claims about Kyle.
  - **`BLOG_SAMPLES=1`:** samples only.
  - **`VERCEL_ENV=preview`:** samples only while there are no published real posts.
  - **Otherwise:** real posts only.
- **Accent:** no new accent uses. Rows use Work-card restraint (thin `border-border` dividers, muted text).
- **No-JS:** every row and level opens and closes natively. The Collapse button is hidden. Hashes only scroll.
- **Heading outline:**
  - **`/blog`:** h1 "Blog", h2 per post title, and a post's `##` renders as h3 (`headingOffset: 1`).
  - **`/blog/[slug]`:** h1 title, and `##` stays h2.
- **Slice 1–3 rules:**
  - Tokens, the global focus ring, 44 px targets.
  - No horizontal page scroll from 320 px up. Wide code scrolls inside its own block.
  - axe zero in both themes. Lighthouse: accessibility 1.0, others ≥ 0.95, target 0.99.
  - No console errors. E2E on Chromium mobile, tablet and desktop, plus WebKit and Firefox.
- **Environment:**
  - Run npm with `npm_config_cache=$TMPDIR/npm-cache`.
  - Run build, e2e, LHCI, git writes and `gh` outside the sandbox.
  - Scan for `* 2*` conflict copies before each task.

## Review Focus

1. **A post whose slug is an existing page id** (`main`, `mobile-menu`) breaks the skip link or the hash. The loader must throw. → Task 1 `getBlogPosts rejects reserved slugs`.
2. **A long code line on a 320 px phone** must scroll inside its block, never the page, and the block must be keyboard-scrollable. → Task 2 `pre is focusable`; Task 5 e2e `320px: no page overflow with a wide code block`.
3. **Reopening a phone entry after closing it from level 2** must start at level 1, not show the old full post. → Task 6 e2e `closing resets the inner level`.
4. **Opening `/blog#<slug>` for an unknown or malformed hash** (`#nope`, `#"]x`) must do nothing and throw nothing. → Task 6 e2e `unknown hash is ignored`.
5. **Activating "Collapse" at the end of a long post** must leave the reader at that entry's row, with focus on it, not stranded far down the page. → Task 6 e2e `Collapse returns to the row`.

---

## File structure

```
content/samples/blog/sample-formatting.mdx   every element in the spec's formatting list
content/samples/blog/sample-long-read.mdx    ≥ 1,500 words of plain sample paragraphs + headings
content/samples/blog/sample-short-note.mdx   short; one tag
content/blog/placeholder-post.mdx            deleted (draft placeholder; unused)
src/lib/content/load.ts                      getBlogPosts(), reserved-slug check
src/lib/format-date.ts                       formatDate()
src/lib/blog.ts                              cached blogPosts() / hasBlog() for pages and layout
src/lib/mdx.tsx                              new elements, headingOffset option
src/lib/site.ts, src/components/header.tsx   showBlog prop
src/app/layout.tsx                           passes showBlog
src/app/blog/page.tsx                        list page (404 when empty)
src/app/blog/[slug]/page.tsx                 post page
src/components/blog/blog-list.tsx            server: <ul> of entries
src/components/blog/blog-entry.tsx           server: one entry's markup
src/components/blog/blog-controller.tsx      client: reset, Collapse, hash
src/components/blog/post-meta.tsx            date + tags (list and post page)
src/app/globals.css                          .blog-entry rules (levels, overlay)
playwright.config.ts, lighthouserc.json      BLOG_SAMPLES=1, new URLs
tests/unit/{content,mdx,header,blog,format-date}.test.*
tests/e2e/{blog,a11y,responsive,theme}.spec.ts
```

---

### Task 1: Published posts, samples, dates

**Files:**

- Create: `content/samples/blog/sample-formatting.mdx`, `sample-long-read.mdx`, `sample-short-note.mdx`, `src/lib/format-date.ts`, `tests/unit/format-date.test.ts`
- Modify: `src/lib/content/load.ts`, `tests/unit/content.test.ts`
- Delete: `content/blog/placeholder-post.mdx`

**Interfaces:**

- Produces:
  - `type BlogEnv = { BLOG_SAMPLES?: string; VERCEL_ENV?: string }`
  - `getBlogPosts(env?: BlogEnv, dirs?: { real?: string; samples?: string }): Promise<BlogPost[]>`. Defaults: `process.env`, `content/blog`, `content/samples/blog`. Returns published posts, newest first.
  - `RESERVED_SLUGS = ["main", "mobile-menu", "none"]`
  - `formatDate(ymd: string): string`

- [ ] **Step 1: Write the failing tests** in `tests/unit/content.test.ts`, using fixture dirs under `tests/fixtures/` (real: one published, one draft, one placeholder; samples: two posts; empty dir):

```ts
test("getBlogPosts returns only published real posts by default", async () => {
  expect((await getBlogPosts({}, { real: R, samples: S })).map((p) => p.slug)).toEqual(["real-one"]);
});
test("BLOG_SAMPLES=1 returns samples only, even with real posts", ...);   // → sample slugs, newest first
test("preview shows samples only while no published real post exists", ...);
  // VERCEL_ENV=preview + empty real dir → samples; + R → ["real-one"]
test("production with drafts/placeholders only → []", ...);
test("getBlogPosts rejects reserved slugs", ...);  // fixture dir with main.mdx → rejects ContentError /reserved/
test("shipped samples are labelled and published", async () => {
  const s = await getBlogPosts({ BLOG_SAMPLES: "1" });
  expect(s.length).toBeGreaterThanOrEqual(3);
  for (const p of s) expect(p.title).toMatch(/^Sample: /);
});
test("production content/blog has no published posts yet", async () => {
  expect(await getBlogPosts({})).toEqual([]);   // update when Kyle's first post lands
});
```

`tests/unit/format-date.test.ts`: `formatDate("2026-11-26") === "Nov 26, 2026"` and `formatDate("2026-01-01") === "Jan 1, 2026"`. Run it under `TZ=America/Los_Angeles` semantics too, by building from parts, not `new Date(ymd)` local.

- [ ] **Step 2: Run** `npx vitest run tests/unit/content.test.ts tests/unit/format-date.test.ts`. Expected: FAIL, `getBlogPosts`/`formatDate` not exported.
- [ ] **Step 3: Implement.**
  - **`getBlogPosts`** in `load.ts`, on top of `getPosts`. Reserved slugs throw `ContentError(file, "filename", "is reserved")`.
  - **`formatDate`:** `Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })` on `Date.UTC(y, m-1, d)`.
  - **Write the three sample posts.** `sample-formatting` covers:
    - `##`, `###`, `####`
    - a paragraph with a link and inline code
    - bulleted and numbered lists
    - a blockquote
    - a fenced code block with one line ≥ 120 chars
    - an `---` rule

    Give each a distinct date and 1–2 tags.

  - **Delete** `content/blog/placeholder-post.mdx`.
  - **Keep `content/blog/`** with a `.gitkeep`. `readEntries` already returns `[]` for a missing dir.
- [ ] **Step 4: Run** the same command. Expected: PASS. Then `npm test` → all green (the existing facts test still scans posts via `getPosts`).
- [ ] **Step 5: Commit** `feat(blog): published-post loader with samples, date format`.

---

### Task 2: MDX elements for posts

**Files:** Modify `src/lib/mdx.tsx`, `tests/unit/mdx.test.tsx`.

**Interfaces:**

- Produces: `renderMdx(source: string, opts?: { headingOffset?: 0 | 1 }): Promise<ReactElement>`. Work pages keep calling it without opts.

- [ ] **Step 1: Write the failing tests:**
  - `headingOffset 0 renders ## as h2, ### as h3, #### as h4`
  - `headingOffset 1 renders ## as h3, ### as h4, #### as h5`
  - `renders ol, blockquote, hr, inline code`: each element is present.
  - `pre is focusable and scrolls`: `pre` has `tabIndex 0` and class `overflow-x-auto`, and its code has a `font-mono` class.
  - `existing p/a/ul styles unchanged`: the current tests stay.
- [ ] **Step 2: Run** `npx vitest run tests/unit/mdx.test.tsx`. Expected: FAIL on the new cases.
- [ ] **Step 3: Implement.** Build the components map per call from `headingOffset`.
  - **Headings:** `text-h2`/`text-h3`/bold for the top two levels and `font-semibold` below, with `mt-8` spacing.
  - **Other elements:**
    - `ol`: `list-decimal`, like `ul`
    - `blockquote`: `border-l-2 border-border pl-4`, muted
    - `hr`: `border-border`
    - inline `code`: `font-mono text-[0.9em]`
    - `pre`: `tabIndex={0}`, `overflow-x-auto rounded-md border border-border p-4 font-mono text-sm`

    Inline-code styling must not double-apply inside `pre`. Style `pre code` back to plain.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(mdx): post elements and heading offset`.

---

### Task 3: Hide Blog from the nav when there are no posts

**Files:**

- Create: `src/lib/blog.ts`
- Modify: `src/components/header.tsx`, `src/app/layout.tsx`, `tests/unit/header.test.tsx`, `playwright.config.ts`, `lighthouserc.json`

**Interfaces:**

- Consumes: `getBlogPosts` (Task 1).
- Produces:
  - `blogPosts(): Promise<BlogPost[]>`, cached with `"use cache"` + `cacheLife("max")`, which calls `getBlogPosts()`
  - `hasBlog(): Promise<boolean>`
  - `Header({ showBlog }: { showBlog: boolean })`

- [ ] **Step 1: Write the failing tests** in `header.test.tsx`:
  - `Header without showBlog has no Blog link (desktop list or menu)`: `queryAllByRole("link", { name: "Blog" })` is empty, and Work and Contact are present.
  - `Header with showBlog renders Blog between Work and the toggle`.

  Update `renderHeader` to take `showBlog` (default `true`).

- [ ] **Step 2: Run** `npx vitest run tests/unit/header.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **`Header`:** filters `siteConfig.nav` by `showBlog`.
  - **`layout.tsx`:** `<Header showBlog={await hasBlog()} />`. The layout becomes `async`; keep it static.
  - **`playwright.config.ts`:** `webServer.env = { BLOG_SAMPLES: "1" }`. It applies to both build and start.
  - **`lighthouserc.json`:** `startServerCommand: "BLOG_SAMPLES=1 npm run start -- -p 3200"`.
- [ ] **Step 4: Run** `npm test`, then `npm run test:e2e -- tests/e2e/theme.spec.ts tests/e2e/shell.spec.ts`. Expected: all PASS. The no-JS Blog-link test passes because samples are on.
- [ ] **Step 5: Commit** `feat(blog): nav shows Blog only when a published post exists`.

---

### Task 4: Post page `/blog/[slug]`

**Files:**

- Create: `src/app/blog/[slug]/page.tsx`, `src/components/blog/post-meta.tsx`, `tests/e2e/blog.spec.ts`

**Interfaces:**

- Consumes: `blogPosts()` (Task 3), `renderMdx` (Task 2), `formatDate` (Task 1).
- Produces: `PostMeta({ post }: { post: BlogPost })`, which renders `<time>` plus a tag list (`ul role=list`, `aria-label="Tags"`, micro-label chips). Tasks 5 and 6 reuse it.

- [ ] **Step 1: Write the failing e2e** in `tests/e2e/blog.spec.ts` (`describe("post page")`):
  - **`every sample post page renders title, date, tags, body`**, for each `getBlogPosts({ BLOG_SAMPLES: "1" })`:
    - status 200
    - h1 = title
    - `time[datetime=date]` text = `formatDate(date)`
    - tag texts
    - `<title>` contains the title
  - **`post headings start at h2`:** `/blog/sample-formatting` has an h2 from `##`.
  - **`unknown slug returns 404`** (`allowedConsole: [/status of 404/]`): `/blog/nope` and `/blog/none` → 404 with h1 "Page not found".
  - **`← All posts returns to /blog`:** the link named "All posts" is ≥ 44 px tall, and its focus outline is not `none`. Skip on WebKit, as in work.spec.
- [ ] **Step 2: Run** `npm run test:e2e -- tests/e2e/blog.spec.ts --project=desktop`. Expected: FAIL (404s / missing route).
- [ ] **Step 3: Implement** the page, mirroring `src/app/work/[slug]/page.tsx`:
  - `ensureStatic = "navigation"`
  - `generateStaticParams` returns the posts' slugs, or `[{ slug: "none" }]` when there are none
  - `generateMetadata` uses the title and summary
  - `notFound()` on a miss
  - `renderMdx(body)` with offset 0
  - back link markup the same as Work's, with `href="/blog"`
- [ ] **Step 4: Run** the same command for all projects. Expected: PASS.
- [ ] **Step 5: Commit** `feat(blog): static post pages with real 404s`.

---

### Task 5: `/blog` list markup and CSS levels

**Files:**

- Create: `src/components/blog/blog-list.tsx`, `src/components/blog/blog-entry.tsx`
- Modify: `src/app/blog/page.tsx`, `src/app/globals.css`, `tests/e2e/blog.spec.ts`

**Interfaces:**

- Consumes: `blogPosts()`, `PostMeta`, `renderMdx(body, { headingOffset: 1 })`.
- Produces the DOM contract that Task 6 relies on (class and data names exact):

```
<ul role="list" class="blog-list">
  <li id="{slug}" class="blog-entry">                  ← position: relative
    <h2 id="{slug}-title">{title}</h2>
    <div class="max-sm:hidden"> summary + <PostMeta/> </div>   ← desktop: always visible
    <time class="sm:hidden">…</time>                           ← phone row: title + date
    <details data-entry>
      <summary aria-labelledby="{slug}-title">  chevron (aria-hidden); desktop hint text
               "Read full post" / "Collapse" (aria-hidden, swaps on [open]) </summary>
      <div class="blog-entry-content">                  ← z-index above the overlay
        <div class="sm:hidden"> summary + <PostMeta/> </div>
        <details data-inner class="sm:hidden"><summary>Read full post</summary></details>
        <div class="blog-entry-body"> {post MDX, offset 1}
          <button data-collapse type="button" class="js-only">Collapse</button>
        </div>
      </div>
    </details>
  </li>
</ul>
```

- **Overlay:** `summary::after { content:""; position:absolute; inset:0 }`. That makes the whole entry clickable. `.blog-entry-content { position:relative; z-index:1 }` keeps clicks inside an open post from toggling it. The focus-visible ring is drawn on `summary::after`, so it outlines the row.
- **Levels (CSS only):**
  - `.blog-entry-body` is `display:none` below 640 px, unless `.blog-entry:has([data-inner][open])`.
  - At 640 px and up it's always shown when the outer details is open.
- **`.js-only`:** add it to the layout's `<noscript>` hide rule.
- **Page:** `/blog` calls `notFound()` when `blogPosts()` is empty. Title "Blog", h1 "Blog", then `BlogList`.

- [ ] **Step 1: Write the failing e2e** (`describe("blog list")`):
  - `lists published samples newest first`: h2 texts equal sample titles sorted by date desc.
  - `desktop: collapsed row shows title, date, summary, tags; one click opens the full post` (tablet, desktop, webkit, firefox):
    - Click the entry's summary text area (`li >> text=<summary>`). The body's first paragraph becomes visible.
    - Click the h2. It closes.
  - `mobile: first tap shows details, second shows the post` (mobile):
    - Tap the row. The summary is visible and the body hidden.
    - Tap "Read full post". The body is visible.
    - Tap the h2. Everything closes.
  - `entries open independently`: open two entries, and both stay open.
  - `row toggle is named by the title and announces state`: `getByRole("button", { name: <title> })` exists, and its `aria-expanded`/open state flips.
  - `inline post headings sit under the entry title`: inside an open sample-formatting entry, the `##` heading is h3.
  - `no-JS: rows open natively and Collapse is hidden` (new context, `javaScriptEnabled: false`).
  - `320px: no page overflow with a wide code block`: open sample-formatting at 320 px. `scrollWidth <= clientWidth`, and `pre` `scrollWidth > clientWidth`.
- [ ] **Step 2: Run** `npm run test:e2e -- tests/e2e/blog.spec.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the markup and CSS per the contract above.
- [ ] **Step 4: Run** the same command. Expected: PASS on all five projects, except the Collapse-behaviour cases that belong to Task 6, which aren't written yet.
- [ ] **Step 5: Commit** `feat(blog): expandable list with two phone levels and one desktop level`.

---

### Task 6: List behaviour (reset, Collapse, hash)

**Files:**

- Create: `src/components/blog/blog-controller.tsx`
- Modify: `src/components/blog/blog-list.tsx` (mount once), `tests/e2e/blog.spec.ts`

**Interfaces:**

- Consumes: the Task 5 DOM contract (`.blog-list`, `li#slug`, `details[data-entry]`, `details[data-inner]`, `button[data-collapse]`).
- Produces: `BlogController({ slugs }: { slugs: string[] })`, a `"use client"` component that renders nothing. It's mounted as a sibling of the `<ul>`.

**Behaviour:**

- **One `toggle` listener in the capture phase** on `.blog-list`, because `toggle` doesn't bubble.
  - **Entry closed:** set the `[data-inner]` inside it to `open=false`. If `location.hash === "#" + slug`, run `history.replaceState(null, "", "/blog")`.
  - **Entry opened:** `history.replaceState(null, "", "#" + slug)`.
- **`[data-collapse]` click:**
  - close the outer details
  - scroll its `li` into view (`block: "start"`; `scroll-padding-top` clears the nav)
  - focus its outer `summary`
- **On mount and on `hashchange`:** if `slugs.includes(hash.slice(1))`, open the outer and inner details and scroll the `li` into view. Otherwise do nothing. Don't use `querySelector` with raw hash text; look up by `slugs` and `getElementById`.

- [ ] **Step 1: Write the failing e2e:**
  - `closing resets the inner level` (mobile): open level 2, tap the h2 to close, reopen. The body is hidden and "Read full post" is not open.
  - `Collapse returns to the row`:
    - Open `sample-long-read` and scroll to its end.
    - Click "Collapse". The details are closed.
    - The `li` top is within the viewport (`0 ≤ top < innerHeight`).
    - `document.activeElement` is its summary.
  - `opening sets #slug, closing clears it`: `page.url()` ends with `/blog#sample-short-note`, then with `/blog`. `history.length` is unchanged.
  - `/blog#sample-long-read opens that entry fully and in view`. On mobile, check the inner level too.
  - `unknown hash is ignored`: `/blog#nope` and `/blog#%22%5Dx` → all entries closed, no page errors (the fixture already fails on console errors).
- [ ] **Step 2: Run** `npm run test:e2e -- tests/e2e/blog.spec.ts`. Expected: FAIL on the new cases.
- [ ] **Step 3: Implement** `BlogController` per the behaviour above.
- [ ] **Step 4: Run** the same command for all projects, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(blog): collapse, inner reset and hash deep links`.

---

### Task 7: Quality pass, verification, PR

**Files:**

- Modify: `tests/e2e/a11y.spec.ts`, `tests/e2e/responsive.spec.ts` (if it enumerates routes), `lighthouserc.json`
- Create: `docs/plans/slice-04-pr.md`, `docs/plans/slice-04-screens/*.png`
- Modify: `docs/plans/CHECKPOINT.md`

- [ ] **Step 1: Extend the a11y e2e.** Add `/blog/sample-formatting` and `/blog/sample-long-read` to `A11Y_ROUTES`. Add `blog list has no axe violations expanded`: open every entry (and the inner level on mobile), both themes, then `scan(page)` → `[]`. Add both post URLs to the LHCI `url` list.
- [ ] **Step 2: Run** `npm run test:e2e` (full). Expected: all PASS. Then `npm run lhci`. Expected: every URL passes the gate. Record the scores for the PR.
- [ ] **Step 3: Verify the production-hidden state** with a local build without samples (outside the sandbox):

```bash
npm run build && npm run start -- -p 3300 &
curl -s -o /dev/null -w "%{http_code}\n" localhost:3300/blog        # 404
curl -s -o /dev/null -w "%{http_code}\n" localhost:3300/blog/none   # 404
curl -s localhost:3300/ | grep -c 'href="/blog"'                     # 0
```

Expected: `404`, `404`, `0`. Stop the server.

- [ ] **Step 4: Run** `npm run lint && npm run format:check && npm run typecheck && npm test`. Expected: clean. Do a manual keyboard pass on `/blog` at 375 px and 1440 px: Tab to a row, Enter opens it, Space closes it, Tab reaches "Read full post" and "Collapse", and focus is always visible.
- [ ] **Step 5: Take the screenshots.**
  - **Phone (375 px):** collapsed, level 1 and level 2.
  - **Desktop (1440 px):** collapsed and open.
  - **Post page:** dark and light.
  - **The prod-hidden nav.**

  Each sample-post screenshot is labelled "sample posts".

- [ ] **Step 6: Write `docs/plans/slice-04-pr.md`.**
  - **Summary.**
  - **Preview URL.**
  - **Test and Lighthouse results.**
  - **Needs Kyle's call:**
    - the copy: "Read full post", "Collapse", "← All posts"
    - syntax highlighting (needs a package)
    - when to write the first post
  - **Conflicts flagged:** the nav is Work, Contact until the first post (agreed order Work, Blog, Contact). The consequence: Blog appears automatically on the next deploy after a post lands.
  - **Slice 6 notes:**
    - sitemap without `/blog` when empty
    - canonical post pages
    - the CSP for `new Function`
  - **The merge-is-production reminder.**
- [ ] **Step 7: Commit.** Update `CHECKPOINT.md` to "Slice 4 built; final review next" and commit `docs: Slice 04 PR description and screenshots`. Push the branch and open the PR with `gh pr create --body-file docs/plans/slice-04-pr.md`.
