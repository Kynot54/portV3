# Slice 04 — Blog: Design

**Date:** 2026-11-26 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md`. Builds on the Slice 1–3 designs (`docs/superpowers/specs/`) and `docs/design-tokens.md`.

## Intent

The Blog is where Kyle's writing will live. He has **no posts yet**. They will come later through an admin area (V3.1+), where he writes and drafts posts in markdown. This slice builds the public side so that:

1. the site never shows an empty or unfinished Blog to a hiring manager, and
2. the day a published post exists, the Blog appears, with no code change.

Reading should be quick. On the list, a reader can open a post **in place**, without leaving `/blog`. Each post also has its own page, so a shared link lands on one post.

## Goals

1. **Hidden until the first post (Kyle chose option B).** While there's no published post:
   - Blog is not in the nav (desktop links or mobile menu)
   - `/blog` returns a real 404
   - every `/blog/<slug>` returns a real 404

   Once one exists, all three appear on the next build automatically.
2. **`/blog` list**, newest first, which expands in place:
   - **Phone (below 640 px), two levels:**
     - *Collapsed:* a row with the title and date.
     - *First tap on the row:* opens the summary, the tags and a **"Read full post"** control.
     - *Tap "Read full post":* the whole post renders inline, under the summary.
   - **Desktop and tablet (640 px and up), one level:**
     - *Collapsed:* the row already shows the title, date, summary and tags.
     - *One click on the row:* opens the full post inline.
   - **Closing takes one action** at any level (Kyle: "one action to minimize it"):
     - Activating the row again closes the entry completely. On phones that includes the inner level, so reopening starts at level 1 again.
     - A **"Collapse"** button at the end of an open post does the same. It also returns the reader to the entry's row (scroll and focus).
3. **Deep links:** `/blog#<slug>` opens that entry in place (see Decided details).
4. **`/blog/[slug]` post page:** a "← All posts" back link, the title, the date, the tags, then the post body. Unknown slugs return a real 404 (the Work fix: `ensureStatic = "navigation"`).
5. **Post formatting** (MDX, the renderer from Slice 3, `src/lib/mdx.tsx`), in the existing type and colour tokens:
   - headings (`##`–`####`)
   - paragraphs, links, bulleted and numbered lists
   - blockquotes
   - inline code and fenced code blocks (monospace, scrolling sideways when wide, **no syntax colours**)
   - horizontal rules
6. **Sample posts for tests and previews.** A sample folder holds 2–3 obviously-sample posts. Together they cover every formatting element above, plus a long post that makes the Collapse button matter.
   - Every sample title starts with "Sample:".
   - The body says it is a sample.
   - No claims about Kyle.

   The samples are shown only when:
   - the build runs under Vercel preview (`VERCEL_ENV === "preview"`), or
   - an explicit env flag is set (e2e, Lighthouse CI, local).

   **They never show on production.** No Vercel settings change is needed.
7. **The quality bar from Slices 1–3:**
   - axe zero, in both themes, collapsed and expanded
   - Lighthouse 0.99–1.0 with accessibility 1.0, on `/blog` and one post page (samples on)
   - responsive at 320 px up
   - full keyboard support and visible focus
   - no console errors
   - works with JavaScript off

## Non-goals

- **The admin area,** login, database or any posting UI (V3.1+, brief). The site must not *block* it: pages get posts only through `getPosts` / `getPost` in `src/lib/content/load.ts`. The post fields stay `title, summary, date, tags, draft` (plus the internal `placeholder`), so a later admin can save posts as committed markdown files or to a database by changing only the loader.
- Tag pages or tag filtering, search, reading time, prev/next links, RSS. With zero posts they add nothing. All are easy to add later.
- Syntax highlighting. It needs a new package. Listed under "Needs Kyle's call."
- Open Graph images, the sitemap and canonical URLs (Slice 6). Each post page gets its own `<title>` and description from its frontmatter. **Recorded for Slice 6:**
  - the sitemap must leave out `/blog` while there are no posts
  - post pages are canonical over the inline copies on `/blog`
- Writing real posts. That's Kyle's, on his schedule.

## Anti-goals (a failure even if it "works")

- **An empty or placeholder Blog visible on production**, in the nav or at `/blog`.
- **Sample posts reaching production.**
- **A Blog that appears without a published post,** or fails to appear after one is added.
- **Breaking no-JS or keyboard use** with the expanding list.
- **Heading order broken by inline posts.** A post's own headings must sit below the entry title in the outline.

## Constraints

- Everything in `CLAUDE.md` and the Slice 1 design (palette, accent rules: **no new accent uses** on the Blog; WCAG AA; reduced motion; full keyboard; Lighthouse gate).
- **No new dependencies** without Kyle's approval. Expanding uses the browser's native `<details>`/`<summary>` (Kyle chose this over shadcn Collapsible). Small client JS is allowed only to:
  - reset the inner level when an entry closes
  - run the Collapse button (hidden when JS is off)
  - sync the URL hash (deep links)
- Next 16 rules already learned:
  - fs reads under `"use cache"` + `cacheLife("max")`
  - `ensureStatic = "navigation"` for real 404s
  - no `dynamicParams` under Cache Components
  - loader paths scoped to `content/`, so nft tracing stays small
- Draft posts and `placeholder: true` posts never render and never count as "a published post." The current `content/blog/placeholder-post.mdx` can stay or go: builder's call.
- E2E runs on Chromium (mobile, tablet, desktop), WebKit and Firefox. The inline expand must work in all of them.

## Approaches considered

| | Approach | Trade-off | Outcome |
|---|---|---|---|
| Empty Blog | A. Show Blog with an empty-state line | Simple, but shows hiring managers an empty section | Rejected |
| | **B. Hide until the first post** | Nav is temporarily Work, Contact (conflicts with the agreed nav order, flagged in the PR) | **Chosen by Kyle** |
| | C. Kyle writes one post before launch | His writing, his schedule | Can happen any time; B covers it |
| Hide mechanism | **Build-time check passed from the layout to the nav and pages** | Needs a redeploy to show Blog, which adding a post causes anyway | **Chosen** (one sensible way) |
| | A manual env switch | Easy to forget; can show an empty Blog | Rejected |
| Expanding | **1. Native `<details>`** | Works without JS, keyboard and screen readers understand it, no dependency | **Chosen by Kyle** |
| | 2. shadcn Collapsible | Smoother animation, but needs JS and a no-JS fallback | Rejected |
| | 3. No expanding | Simplest, but drops what Kyle asked for in Slice 1 | Rejected |

## Decided details

- **Date format:** `Nov 26, 2026` in a `<time dateTime="2026-11-26">`.
- **Tags:** plain text chips (not links), in the muted micro-label style.
- **Row look:** the Work-card restraint (thin border or divider, no accent). The open/closed state is shown with a chevron and an accessible state (native `<details>` gives `expanded`).
- **Inline post headings** are shifted one level down: `##` in a post becomes an `h3` under the entry's `h2` title. On the post page, `##` stays `h2` under the page `h1`.
- **Visible text copy** (Kyle to approve in the PR):
  - "Read full post"
  - "Collapse"
  - "← All posts"
- **Breakpoint:** 640 px (`sm`), the same as the nav.
- **No "open as page" link; the address bar links to the open post (Kyle, 2026-11-26).**
  - Each entry has `id="<slug>"`.
  - **Opening an entry** replaces the URL with `/blog#<slug>`, using `history.replaceState` so no history entry is added.
  - **Closing it** puts the URL back to `/blog`. If several entries are open, the URL follows the one most recently opened, and closing that one clears the hash.
  - **Loading `/blog#<slug>`** opens that entry fully (both levels on phones) and scrolls it into view, below the nav (`scroll-padding-top`).
  - **An unknown hash** does nothing.
  - **Without JS,** the hash still scrolls to the entry, which stays closed.
  - Shared and cross-posted links still go to `/blog/<slug>`.
- **The click target is the whole row, with a short accessible name (my call).**
  - The entry title is a real `h2` **outside** `<summary>`, so it stays in the heading outline. Chromium and WebKit drop headings that sit inside `<summary>`.
  - `<summary>` holds only the toggle. Its accessible name is the post title. A stretched overlay (a positioned pseudo-element) makes the whole row clickable.
  - Screen readers hear "Post title, button, collapsed", not the whole row read out. This keeps Kyle's "one click on the row" and the heading-order anti-goal both true.
- **Entries open independently (my call).** Opening one entry doesn't close the others. An exclusive accordion would collapse a long open post above and make the page jump. Collapse acts only on its own entry.
- **Samples never mix with real posts (my call).**
  - **Vercel preview:** shows the samples only while there are no published real posts.
  - **e2e, Lighthouse CI and local:** an explicit flag makes the build read **only** the samples, so tests stay stable once real posts exist.
  - **Production:** never reads the samples.
- **Testing the hidden state (my call).** Unit and integration tests cover:
  - the "has published posts" check: empty, drafts only, placeholders only, one real post
  - the nav without Blog
  - `/blog` and `/blog/[slug]` calling `notFound()` when there are no posts

  There is no second production build in CI. The cost if wrong: a build-level slip could show Blog on production. Kyle's first look at production after the merge would catch it.
- **Cost accepted:** `/blog` HTML carries every post's full text. That's fine for dozens of posts. Load on demand if it ever grows past that.

## Left to the builder

- **The DOM structure** that gives two levels on phones and one on desktop. Options include:
  - nested `<details>`, with breakpoint-specific content
  - `::details-content`
  - two breakpoint-specific renders

  Prefer not duplicating post bodies in the HTML. Whatever is chosen must pass the keyboard, screen-reader-name, no-JS and three-browser tests.
- Where the sample posts live, as long as loader tracing stays scoped to `content/`, and the name of the env flag.
- **The zero-posts build.** `/blog/[slug]` must build and 404 when `generateStaticParams` would return nothing. If Cache Components requires at least one param, solve it without making a fake post reachable.
- Exact spacing, chevron icon (lucide, already installed), and the MDX element styles within the existing tokens.
- How the nav receives "has posts". Today `Header` is a client component reading `siteConfig.nav`.
