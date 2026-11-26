# Slice 06: Launch Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make kwhynott.dev findable, shareable and hardened:

- 100+ character descriptions, canonical links and Open Graph/Twitter metadata on every page
- a preview card per page
- `robots.txt` and a gated sitemap
- security headers
- a final audit, with a live checklist for Kyle

**Architecture:**

- **SEO module.** One small module (`src/lib/seo.ts`) owns the copy and builds every page's `Metadata` through one helper, so nested pages never drop the root's Open Graph fields.
- **Preview cards.** They use Next's `opengraph-image.tsx` convention with a shared card renderer. They're prerendered at build time from a committed Geist font.
- **Headers.** A pure function supplies them to `next.config.ts` `headers()`. Pages stay static.

**Tech Stack:** The Slice 1–5 stack. `next/og` (`ImageResponse`), `app/robots.ts` and `app/sitemap.ts` are all built into Next 16.4.6. **No new packages.**

**Spec:** `docs/superpowers/specs/2026-11-26-slice-06-launch-design.md` (approved 2026-11-26).

## Approach, alternatives, risks

- **Approach:** copy and metadata → preview cards → robots and sitemap → headers → audit and PR.
- **Alternatives:** listed in the spec (fixed CSP chosen over nonces and SRI; per-page cards chosen over one card or hand-made cards).
- **Risks:**
  - **The CSP blocks something only production loads.** Examples are Cloudflare's beacon and the real Cal.com embed. The PR checklist has Kyle check the console on the preview and on live.
  - **A nested `metadata.openGraph` replaces the root's object rather than merging with it.** Every page therefore goes through `pageMetadata()`.
  - **Merging is a production deploy.**

## Global Constraints

- **Site description (exact):** "I'm Kyle Whynott, an AI and software engineer. I've built AI document pipelines for 50+ clients and taught machine learning at Cal State Fullerton."
- **Page descriptions (exact; Kyle signs off in the PR):**
  - `/work`: "Selected projects I've built and shipped, from AI document pipelines to full-stack apps. Each one covers the context, what I built, the result, and what I learned."
  - `/blog`: "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended."
  - `/contact`: "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days."
  - **Project pages:** `summary + " " + context`, trimmed at a word boundary to ≤ 160 characters (with "…" when cut).
  - **Posts:** `summary`, or `summary + " " + first paragraph of body` trimmed to ≤ 160 when the summary is under 100.
  - **Every live description is ≥ 100 characters.**
- **Metadata on every page:**
  - `title`, `description`, `alternates.canonical` (absolute `https://kwhynott.dev<path>`)
  - `openGraph`: `title`, `description`, `url`, `siteName: "Kyle Whynott"`, `type` (`"website"`, or `"article"` with `publishedTime` for posts), `locale: "en_US"`
  - `twitter: { card: "summary_large_image" }`
  - Images come from the route's `opengraph-image`.
- **Card:** 1200×630 PNG, background `#000000`.
  - **Top left:** "KW" (Geist Bold, `#F5F5F5`).
  - **Middle:** the title (Geist Bold, `#F5F5F5`, about 72 px, at most 3 lines).
  - **Bottom left:** a 14 px `#39FF14` dot plus "Kyle Whynott · AI / Software engineer" (`#8A8A8A`, about 30 px).
  - **Bottom right:** "kwhynott.dev" (`#8A8A8A`).
  - **Alt:** `"<title>, Kyle Whynott"`.
  - **Card titles:**
    - Home: "I'm Kyle Whynott, an AI engineer."
    - Work: "Work". Blog: "Blog". Contact: "Contact".
    - Projects and posts: their titles.
- **`robots.txt`:** `User-agent: *`, `Allow: /`, `Disallow: /api/`, `Sitemap: https://kwhynott.dev/sitemap.xml`.
- **Sitemap:**
  - **Always:** `/`, `/work`, every `getWorkList()` slug, `/contact`.
  - **Only when `blogPosts()` is non-empty:** `/blog` and each post (`lastModified` = the post date).
  - **`/services` only when `isServicesEnabled()`.**
  - **Never:** `/blog/none`, `/api`.
- **Production CSP (exact, directives joined with `; `):**
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.cal.com https://static.cloudflareinsights.com`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: https:`
  - `font-src 'self'`
  - `connect-src 'self' https://challenges.cloudflare.com https://app.cal.com https://cal.com https://cloudflareinsights.com`
  - `frame-src https://challenges.cloudflare.com https://app.cal.com https://cal.com`
  - `frame-ancestors 'none'`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `upgrade-insecure-requests`
- **Policy variants:**
  - **`VERCEL_ENV === "preview"`:** append `https://vercel.live` to `script-src`, `connect-src` and `frame-src`.
  - **Not on Vercel (`!VERCEL`):** drop `upgrade-insecure-requests`.
- **Other headers:**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
  - `X-Frame-Options: DENY`

  All of them apply to `/:path*`.

- **Font:** commit `src/assets/fonts/Geist-Bold.ttf` (SIL OFL, from the `vercel/geist-font` release) and read it with `fs` at build time. It's never fetched at request time.
- **Slice 1–5 rules:**
  - axe zero, Lighthouse 100 target, no console errors (a CSP violation is a console error).
  - Pages stay static.
  - Run npm with `npm_config_cache=$TMPDIR/npm-cache`. Run build, e2e, LHCI and git writes outside the sandbox. Scan for `* 2*` copies before each task.

## Review Focus

1. **A nested page's metadata silently drops the root's Open Graph fields** (og:image, site name, Twitter card). → Task 2 e2e `every route has full OG/Twitter tags`.
2. **A long or short project summary yields a description that's cut mid-word, is over 160 characters or is under 100.** → Task 1 `trim at a word boundary`, `every live description is 100–160`.
3. **The headers block Turnstile, Cal.com or the theme script.** It would show as a console error or a broken flow. → Task 4 e2e: the full contact and theme suites run with headers on, and the fixture fails on any `Refused to` error.
4. **A production build with no posts lists `/blog` in the sitemap.** → Task 3 `sitemap omits blog with no posts`.
5. **Canonical or OG URLs point at a preview or localhost host.** → Task 2 `canonical is absolute on kwhynott.dev`.

---

## File structure

```
src/lib/seo.ts                       SITE_DESCRIPTION, PAGE_DESCRIPTIONS, describeWork(), describePost(), pageMetadata()
src/lib/og-card.tsx                  renderCard(title): ImageResponse; CARD_SIZE
src/assets/fonts/Geist-Bold.ttf      committed font (OFL)
src/app/opengraph-image.tsx          Home card (and the default)
src/app/{work,blog,contact}/opengraph-image.tsx
src/app/work/[slug]/opengraph-image.tsx, src/app/blog/[slug]/opengraph-image.tsx
src/app/robots.ts, src/app/sitemap.ts
src/lib/security-headers.ts          securityHeaders(env)
next.config.ts                       headers()
pages' metadata → pageMetadata()     layout.tsx, page.tsx, work/*, blog/*, contact
tests/unit/{seo,sitemap,security-headers}.test.ts
tests/e2e/seo.spec.ts                head tags, cards, robots, sitemap, headers
docs/plans/slice-06-pr.md            incl. Kyle's live checklist
```

---

### Task 1: Descriptions and the SEO module

**Files:**

- Create: `src/lib/seo.ts`
- Test: `tests/unit/seo.test.ts`
- Modify: `tests/unit/content.test.ts` (the facts list)

**Interfaces:**

- Produces:
  - `SITE_DESCRIPTION: string`
  - `PAGE_DESCRIPTIONS: { work: string; blog: string; contact: string }`
  - `trimTo(text: string, max: number): string`: word boundary, appends "…" when cut.
  - `describeWork(e: WorkEntry): string`
  - `describePost(p: BlogPost): string`

- [ ] **Step 1: Write the failing tests:**
  - `SITE_DESCRIPTION and page descriptions are the exact copy` (the Global Constraints strings)
  - `trim at a word boundary`:
    - `trimTo("aaa bbb ccc", 8) === "aaa bbb…"`
    - Text under the limit is returned unchanged.
    - The result is never longer than `max`.
  - `describeWork is summary + context, ≤ 160`
  - `describePost falls back to summary + first paragraph under 100`
  - `every live description is 100–160` (Home, Work, Blog, Contact, every `getWorkList()` entry, every `getBlogPosts({})` post)
  - **In `content.test.ts`:** add `SITE_DESCRIPTION` to the facts copy list. "50+ clients" must map to the résumé's existing claim.
- [ ] **Step 2: Run** `npx vitest run tests/unit/seo.test.ts tests/unit/content.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `seo.ts`.** For `describePost`, the first paragraph is the first non-empty MDX line that isn't a heading, list or quote, with markdown links and emphasis stripped to plain text.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(seo): descriptions for every page`.

---

### Task 2: Metadata on every page

**Files:**

- Modify: `src/lib/seo.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/contact/page.tsx`
- Test: `tests/unit/seo.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**

- Consumes: Task 1.
- Produces: `pageMetadata(o: { title?: string; description: string; path: string; type?: "website" | "article"; publishedTime?: string }): Metadata`.
  - Absolute canonical: `new URL(path, "https://kwhynott.dev")`.
  - Builds the full `openGraph` (Global Constraints) and the `twitter` object.
  - With no `title`, it leaves the title to the root template default.
  - `layout.tsx` keeps `metadataBase` and the title template, and its `description` becomes `SITE_DESCRIPTION`.

- [ ] **Step 1: Write the failing tests.**
  - **Unit:**
    - `pageMetadata builds canonical, openGraph and twitter`
    - **`canonical is absolute on kwhynott.dev`** (even when `NEXT_PUBLIC_SITE_URL` is set to a preview host)
    - `article type carries publishedTime`
  - **E2E** (`tests/e2e/seo.spec.ts`, `describe("head tags")`), for each of `/`, `/work`, every work slug, `/blog`, every sample post, `/contact`. Assert:
    - `meta[name=description]` content length is ≥ 100
    - `link[rel=canonical]` is `https://kwhynott.dev<path>`
    - `og:title`, `og:description`, `og:url`, `og:site_name` = "Kyle Whynott", `og:type`
    - `og:image` present
    - `twitter:card` = `summary_large_image`

    This is **`every route has full OG/Twitter tags`**.
- [ ] **Step 2: Run** `npx vitest run tests/unit/seo.test.ts`, then `npm run test:e2e -- tests/e2e/seo.spec.ts --project=desktop`. Expected: FAIL.
- [ ] **Step 3: Implement** `pageMetadata` and replace each page's `metadata` / `generateMetadata` with it. Work and posts use `describeWork` / `describePost`.
- [ ] **Step 4: Run** the unit tests, then e2e (all projects). Expected: the unit tests and the head-tag tests pass except `og:image`, which is Task 3's.
- [ ] **Step 5: Commit** `feat(seo): canonical, Open Graph and Twitter metadata on every page`.

---

### Task 3: Preview cards, robots, sitemap

**Files:**

- Create:
  - `src/assets/fonts/Geist-Bold.ttf`
  - `src/lib/og-card.tsx`
  - `src/app/opengraph-image.tsx`
  - `src/app/{work,blog,contact}/opengraph-image.tsx`
  - `src/app/work/[slug]/opengraph-image.tsx`
  - `src/app/blog/[slug]/opengraph-image.tsx`
  - `src/app/robots.ts`, `src/app/sitemap.ts`
- Test: `tests/unit/sitemap.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**

- Consumes: `blogPosts()` (`src/lib/blog.ts`), `getWorkList()`, `isServicesEnabled()`.
- Produces:
  - `CARD_SIZE = { width: 1200, height: 630 }`
  - `renderCard(title: string): Promise<ImageResponse>`
  - Each `opengraph-image.tsx` exports `alt`, `size`, `contentType = "image/png"`, and a default.
  - **Dynamic routes:** a `generateStaticParams` that mirrors the page's (the blog one returns the `none` sentinel when empty, as the page does) and an `ensureStatic` that matches.
  - **Unknown slug:** `notFound()`.
  - `sitemap.ts` exports `buildSitemap(deps: { work: { slug: string }[]; posts: BlogPost[]; services: boolean }): MetadataRoute.Sitemap` plus the default export that calls it with real data.

- [ ] **Step 1: Write the failing tests.**
  - **Unit:**
    - `sitemap lists home, work, projects, contact`
    - **`sitemap omits blog with no posts`**
    - `sitemap lists blog and posts with lastModified when posts exist`
    - `services only when enabled`
    - `never lists /blog/none or /api`
  - **E2E** (`describe("cards and crawl files")`):
    - `each route's og:image is a 1200×630 PNG`: fetch the `og:image` URL, check status 200 and `content-type: image/png`, and read the width and height from the PNG IHDR bytes 16–23.
    - `og:image:alt ends with ", Kyle Whynott"`
    - `robots.txt matches`: the exact lines.
    - `sitemap.xml has the expected URLs`: samples on, so `/blog` and the sample posts are listed; `/blog/none` is absent.
- [ ] **Step 2: Run** `npx vitest run tests/unit/sitemap.test.ts`, then `npm run test:e2e -- tests/e2e/seo.spec.ts --project=desktop`. Expected: FAIL.
- [ ] **Step 3: Implement.** Download `Geist-Bold.ttf` from the `vercel/geist-font` GitHub release once (outside the sandbox) and commit it with its OFL notice (`src/assets/fonts/OFL.txt`). The card layout follows Global Constraints.
- [ ] **Step 4: Run** `npm test`, then the full `npm run test:e2e`. Expected: PASS, including Task 2's `og:image` checks.
- [ ] **Step 5: Commit** `feat(seo): preview cards, robots.txt and sitemap`.

---

### Task 4: Security headers

**Files:**

- Create: `src/lib/security-headers.ts`
- Modify: `next.config.ts`
- Test: `tests/unit/security-headers.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**

- Produces: `securityHeaders(env: Record<string, string | undefined>): { key: string; value: string }[]`. `next.config.ts` returns `[{ source: "/:path*", headers: securityHeaders(process.env) }]`.

- [ ] **Step 1: Write the failing tests.**
  - **Unit:**
    - `production policy is exact`: `{VERCEL:"1", VERCEL_ENV:"production"}` gives the Global Constraints CSP string verbatim plus the five other headers.
    - `preview adds vercel.live to script/connect/frame only`
    - `off Vercel drops upgrade-insecure-requests only`
  - **E2E:**
    - `headers present on pages`: `/` and `/contact` responses carry all six headers.
    - **The existing contact, theme, blog and a11y suites run under the headers.** The fixture already fails on any console error, which includes `Refused to load…` and `Refused to execute…`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/security-headers.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `securityHeaders` and `headers()`.
- [ ] **Step 4: Run** `npm test`, then the full `npm run test:e2e`. Expected: all PASS. A CSP violation in any flow fails here; fix the policy, not the test.
- [ ] **Step 5: Commit** `feat(security): CSP and security headers`.

---

### Task 5: Launch audit and PR

**Files:**

- Create: `docs/plans/slice-06-pr.md`, `docs/plans/slice-06-screens/*` (the card PNGs)
- Modify: `docs/plans/CHECKPOINT.md`, `README.md` (a short "Launch checklist" section)

- [ ] **Step 1: Run the full local bar.** That's lint, format, typecheck, unit, full e2e and `npm run lhci`. Expected: all pass, and Lighthouse stays at ≥ 0.99 with the headers on.
- [ ] **Step 2: Do a manual keyboard pass** on every route at 375 px and 1440 px, and note it in the PR. Save the Home, project and post cards as PNGs for the PR.
- [ ] **Step 3: Run the live curl checks** that Cloudflare answers itself:
  - `www.kwhynott.dev/blog` → 301 → `https://kwhynott.dev/blog`
  - `http://kwhynott.dev` → `https://`
- [ ] **Step 4: Write `slice-06-pr.md`.**
  - **Summary.**
  - **Needs Kyle's call:**
    - all description copy
    - the card layout
    - favicon sign-off
    - project screenshots (TODO)
  - **Conflicts:** none expected.
  - **Kyle's live checklist, after the merge deploys:**
    1. LinkedIn Post Inspector on `/` and a project: no warnings, and the card shows.
    2. Search Console: submit `https://kwhynott.dev/sitemap.xml`, and run URL Inspection on `/`.
    3. On live `/contact`: open DevTools Console, send a test message, press Book a call. There should be no "Refused to…" errors (this also checks the Cloudflare beacon).
    4. View the page source of `/`: it should have `og:image` and a description.
  - **Merging is a production deploy.**
- [ ] **Step 5: Commit, push and open the PR.** Update the checkpoint.
