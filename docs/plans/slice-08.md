# Slice 8: Project images and clips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each project can show two images and an optional silent clip:

- **Cards:** image 1 is the thumbnail. The clip plays while the card is hovered or keyboard-focused, on devices with a mouse and only when reduced motion is off.
- **Project page:** both images near the top, and the clip with controls at the bottom.

**Architecture:**

- **Frontmatter:** `media` (two images with alt text, an optional clip with a description), validated by the content loader. The build fails on a missing file or missing alt text.
- **`CardMedia`:** a small client component on `WorkCard` that owns the hover, focus and leave state.
- **The page:** two server-rendered pieces, the images and the clip section.
- **e2e:** a sample project with tiny generated media, shown only when `WORK_SAMPLES=1` and never in production (the same pattern as `BLOG_SAMPLES`), exercises all of it while no real media exists.

**Tech Stack:** Next.js 16 (App Router, Cache Components), `next/image`, React 19, Tailwind 4, Vitest + Testing Library (jsdom), Playwright + axe, LHCI.

**Spec:** `docs/superpowers/specs/2026-11-27-slice-08-work-media-design.md` (approved by Kyle, 2026-11-27, with a condition: revisit hosting if traffic surges).

## Global Constraints

- **No new dependencies and no CSP change:** media is served from the site itself. No video host.
- **Card clip:** plays only when `(hover: hover) and (pointer: fine)` matches and `(prefers-reduced-motion: reduce)` doesn't. It never plays on phones or tablets.
- **Card clip attributes:**
  - It plays on hover or focus within the card, and loads only then (`muted`, `loop`, `playsInline`, `preload="none"`, `aria-hidden`).
  - On leave or blur it pauses, rewinds to 0 and is hidden, and the still shows.
- **Project page clip:** never autoplays. It has `controls`, `muted`, `playsInline` and `preload="none"`, with image 1 as the poster and the clip's description as a visible caption.
  - It sits under the heading "See it in action", as the last section (after "Built with").
- **Project page images:** both sit near the top, in place of "Preview coming soon". Side by side from `md` up, stacked below. Image 1 has `priority`.
- **No media yet:** the card is unchanged, the page keeps the placeholder, and no clip section appears.
- **Paths:**
  - Files: `public/images/work/<slug>/`.
  - URLs: `/images/work/<slug>/<src>`.
  - Exactly two images. Alt text is required (non-empty). If a clip is listed, its `description` is required.
- **Layout:** media reserves 16:9 (`aspect-video`), so there's no layout shift.
- **Quality bar:** axe 0; Lighthouse accessibility 1.0, every other category ≥ 0.95; no console errors.
- **Real media and alt text:** Kyle provides the files. Alt text and descriptions are copy, so they go in a later PR for his approval. This slice ships the mechanism, the sample and the README spec.

## Review Focus

1. **Hover leaves before `play()` resolves:** no unhandled rejection and no console error, and the still is back. Pinned in Task 3 (unit) and Task 5 (e2e, fast in and out).
2. **Moving the pointer quickly across several cards:** at most one card's clip is visible at a time. Pinned in Task 5.
3. **Reduced motion switched on while the page is open** (`matchMedia` change event): a hover after that doesn't play. Pinned in Task 3.
4. **A project with images but no clip:** the card shows the still and nothing happens on hover (no `<video>`). The page shows images and no "See it in action". Pinned in Tasks 3–4.
5. **The browser can't decode the clip** (Playwright's Chromium has no H.264): `play()` rejects quietly and the still stays. Pinned in Task 3 (a rejected play mock) and Task 5 (runs in Chromium).

---

### Task 1: Media in the content model

**Files:**

- Modify: `src/lib/content/types.ts`, `src/lib/content/load.ts`
- Create fixtures:
  - `tests/fixtures/content/work-media/` (one entry with full media, one with images only)
  - bad-media dirs: `work-media-missing-file`, `work-media-no-alt`, `work-media-one-image`, `work-media-clip-no-description`
  - `tests/fixtures/media/<slug>/` with tiny files
- Test: `tests/unit/content.test.ts`

**Interfaces:**

- Produces:
  - `type WorkMedia = { images: [MediaImage, MediaImage]; clip: { src: string; description: string } | null }`
  - `type MediaImage = { src: string; alt: string }`. `src` values are resolved to absolute URL paths (`/images/work/<slug>/1.png`).
  - `WorkEntry.media: WorkMedia | null`
  - `getWork(dir?, mediaRoot = "public/images/work")` and `getWorkList(dir?, env = process.env, mediaRoot?)`. Existing call sites keep working with defaults.

- [ ] **Step 1: Write the failing tests**
  - **Full media:** the fixture's `media` resolves to `{ images: [{ src: "/images/work/<slug>/1.png", alt: "…" }, …], clip: { src: "/images/work/<slug>/clip.mp4", description: "…" } }`.
  - **Images only:** `clip` is `null`. No `media` key gives `media: null`.
  - **Each bad dir** throws `ContentError` with field `media`, naming the problem:
    - a missing file → "…not found"
    - empty alt text → "alt is required"
    - one image → "exactly two images"
    - a clip without a description → "description is required"
  - **Real content:** all five real entries have `media: null` (nothing has been supplied yet).
- [ ] **Step 2:** `npx vitest run tests/unit/content.test.ts`. Expected: the new tests fail.
- [ ] **Step 3: Implement** `media(r, mediaRoot)` in `load.ts` (with `existsSync` on `join(mediaRoot, slug, src)`), used by `toWork`. Add `media: null` to the test fixtures that build `WorkEntry` objects by hand (`home.test`, `sitemap.test`, and others; typecheck lists them).
- [ ] **Step 4:** `npm test && npm run typecheck`. Expected: everything passes.
- [ ] **Step 5:** commit: `feat(work): media in project frontmatter, validated at build`

### Task 2: The sample project (e2e only)

**Files:**

- Create:
  - `content/samples/work/sample-media.mdx`: a full CARL entry, `placeholder: false`, `featured: false`, with full media
  - `public/images/work/sample-media/1.png`, `2.png` and `clip.mp4`
  - `scripts/make-sample-media.mjs`, which writes the PNGs. The constraints:
    - **PNGs:** 1920×1080, two flat colours, made with Node's `zlib`, no new package.
    - **Clip:** a valid, silent, tiny (under 200 KB) MP4 or WebM, generated locally with Playwright's Chromium (`canvas.captureStream` + `MediaRecorder`). No third-party footage.
- Modify:
  - `src/lib/content/load.ts`: `getWorkList` appends the samples when `env.WORK_SAMPLES === "1" && env.VERCEL_ENV !== "production"`
  - `playwright.config.ts` and `lighthouserc.json`: `WORK_SAMPLES=1`. Add `http://localhost:3200/work/sample-media` to the LHCI URLs.
  - the e2e tests that count work cards or list slugs: use the loader with `{ WORK_SAMPLES: "1" }`, as the blog tests use `BLOG_SAMPLES`
- Test: `tests/unit/content.test.ts`

- [ ] **Step 1: Write the failing tests**
  - `getWorkList("content/work", { WORK_SAMPLES: "1" })` ends with `sample-media`.
  - With `VERCEL_ENV: "production"` too, it doesn't.
  - Without the flag, it doesn't.
- [ ] **Step 2:** run the tests. Expected: they fail.
- [ ] **Step 3: Implement.** Run `node scripts/make-sample-media.mjs` once and commit its output.
- [ ] **Step 4:** `npm test`. Expected: all pass.
- [ ] **Step 5:** commit: `test(work): sample project with media, e2e and Lighthouse only`

### Task 3: Card thumbnail and hover clip

**Files:**

- Create: `src/components/work/card-media.tsx` (`"use client"`)
- Modify: `src/components/work/work-card.tsx`. When `entry.media` is set, render `CardMedia` above the label, inside the link.
- Test: `tests/unit/card-media.test.tsx`

**Interfaces:**

- Consumes: `WorkMedia` (Task 1).
- Produces: `CardMedia({ media, sizes }: { media: WorkMedia; sizes: string })`. Hover and focus are read from the closest card link (`pointerenter`/`pointerleave` and `focusin`/`focusout` on the parent `<a>`), so the whole card triggers it.

- [ ] **Step 1: Write the failing tests** (mock `matchMedia` and `HTMLMediaElement.prototype.play/pause`):
  - **Fine pointer, motion allowed:**
    - `pointerenter` on the card → `play` is called once and the video is visible (`data-playing="true"` on the wrapper).
    - `pointerleave` → `pause` is called, `currentTime` is 0 and the still is visible again.
  - **Focus:** focusing the card link plays; blurring stops.
  - **Reduced motion, or a coarse pointer** (`(hover: hover) and (pointer: fine)` false): hover doesn't call `play`.
  - **Reduced motion switched on after render** (fire the media query's change event): a later hover doesn't play (Review Focus 3).
  - **`play` rejects** (`NotSupportedError`): no unhandled rejection, and the still stays (Review Focus 5).
  - **Leave before `play` resolves:** it ends paused and the still shows (Review Focus 1).
  - **No clip:** no `<video>` element, and the still is rendered with `alt=""`. The card's link name stays the title.
  - **Attributes:** the video has `muted`, `loop`, `playsinline`, `preload="none"` and `aria-hidden="true"`.
- [ ] **Step 2:** `npx vitest run tests/unit/card-media.test.tsx`. Expected: it fails (no module).
- [ ] **Step 3: Implement.**
  - **Still:** `next/image` with `fill` inside an `aspect-video rounded-lg overflow-hidden` box.
  - **Clip:** absolutely positioned over the still, hidden until playing.
  - **Sizes:** Home's card grid and the Work list pass their own `sizes` strings.
- [ ] **Step 4:** `npm test && npm run lint && npm run typecheck`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(work): card thumbnail; hover or focus plays the clip on mouse devices`

### Task 4: Project page images and clip

**Files:**

- Create:
  - `src/components/work/project-images.tsx`: two `next/image`s, a `md:grid-cols-2` grid, `aspect-video` each, image 1 `priority`, `sizes="(min-width: 768px) 384px, 100vw"`
  - `src/components/work/project-clip.tsx`: `<section aria-labelledby>`, h2 "See it in action", `<figure>` with `<video>` and `<figcaption>`
- Modify: `src/app/work/[slug]/page.tsx`. Use `ProjectImages` when `entry.media`, otherwise `MediaPlaceholder`. Put `ProjectClip` after "Built with" when `entry.media?.clip`.
- Test: `tests/unit/work.test.tsx`

- [ ] **Step 1: Write the failing tests**
  - **Images:** with full media, two images with their alt text, and no "Preview coming soon".
  - **Clip:** the "See it in action" heading is the last h2. The video has `controls`, `muted`, `playsinline`, `preload="none"` and `poster` = image 1's URL, and no `autoplay`. The figcaption equals the description.
  - **Images only:** the images, and no clip section.
  - **`media: null`:** the placeholder as before.
- [ ] **Step 2:** run the tests. Expected: they fail.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** `npm test`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(work): project page images and a "See it in action" clip`

### Task 5: E2E, Lighthouse, docs

**Files:**

- Create: `tests/e2e/work-media.spec.ts`
- Modify:
  - `tests/e2e/a11y.spec.ts`: add `/work/sample-media` (both themes)
  - `README.md`: replace "Adding project screenshots" with "Adding project media". The spec's file table, the frontmatter example and the alt-text rule. Plus a "Revisit" note: if traffic surges, move the clips to a host.
  - `docs/plans/CHECKPOINT.md`

- [ ] **Step 1: Write the e2e tests** (desktop projects unless noted):
  - **Hover:** hovering the sample card on `/work` makes its video visible and not paused, or, where the browser can't decode it, `data-playing="true"`. Moving away shows the still and a paused video at `currentTime` 0.
  - **Keyboard:** Tab to the sample card plays; Tab away stops.
  - **Reduced motion** (`page.emulateMedia({ reducedMotion: "reduce" })`): hover doesn't play.
  - **Phones and tablets** (the mobile and tablet projects, which have touch and no hover): tapping or scrolling never plays. A tap navigates to the project page.
  - **Quick sweep:** moving across all cards leaves at most one `[data-playing="true"]` (Review Focus 2).
  - **Project page:** two images, then the clip section last. The video is paused after load and has controls. No "Preview coming soon".
  - **CLS:** the card's media box keeps its 16:9 size before and after the image loads.
- [ ] **Step 2:** `npm run test:e2e`. Expected: it passes once Tasks 1–4 are in, so a first green run is expected. Then break the leave handler on purpose to confirm the hover test fails, and restore it.
- [ ] **Step 3:** `npm run lhci`. Expected: every URL, `/work/sample-media` included, at 100 for accessibility and ≥ 0.95 elsewhere.
- [ ] **Step 4:** commit: `test(work): media e2e and Lighthouse; README media spec`

### Task 6: Final review and PR

- [ ] Whole-branch review (executing-plans' final review), then the fix pass.
- [ ] The PR body in `docs/plans/slice-08-pr.md`:
  - screenshots of the sample card (still and playing) and the sample page
  - the test evidence
  - **Needs Kyle's call:** the card thumbnail's look, the "See it in action" heading
  - **Kyle's next step:** add the files, then a follow-up PR with alt text for his approval
- [ ] Open the PR. Kyle merges.
