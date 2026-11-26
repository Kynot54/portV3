## ⚠️ Merging deploys to production

`kwhynott.dev` serves `main`, so merging publishes:

- the new `/work` pages
- Home's change from **"10+ clients" to "50+ clients"**, on both the hero proof line and the first card
- Home's cards now opening each project's page

## Summary

- **`/work`:** all five projects, in order:
  1. AI document pipelines
  2. C.O.N.T.R.O.L. BH
  3. Ulti-Health
  4. Video-interview plugin
  5. AI Mind Companion
- **`/work/[slug]`:** five static project pages told as **CARL**: Context → What I built (Action) → Result ("What it does" for the two personal projects) → What I learned → Built with → role · location · period.
- **Media:** each page has a clearly marked **"Preview coming soon"** placeholder in a 16:9 slot (`TODO(kyle)`).
- **MDX:** each project's "What I built" text is rendered by **`@mdx-js/mdx`** (approved) at build time. Broken MDX fails the build. The Blog will reuse it in Slice 04.
- **Content:** each work entry gained context, role, location, period, result, learned and tools. The loader validates them, and a missing field fails the build.
- **`resume.md`:**
  - Working Entrepreneurs now says over **50** clients.
  - AI Mind Companion gains your facts: speech-to-text and text-to-speech, flagging possible early signs of dementia, a native mobile app, FastAPI on Cloud Run and Cloud Functions, and a JSONL vector store.
- **Facts test:** every number on Home _and_ the work pages must map to its exact resume phrase.
- **Deploy size fix:** the content loader traced the **whole project** (including `public/`) into the server bundle. It now traces only the 6 content files.
- **Caching:** content reads use `"use cache"` + `cacheLife("max")`, Home included.

The design is in `docs/superpowers/specs/2026-11-26-slice-03-work-design.md` and the plan in `docs/plans/slice-03.md`.

## Preview URL

https://portv3-git-slice-03-work-kynot54s-projects.vercel.app (sign in to Vercel)

## Screenshots

| /work (1440, dark)                                                                                                  | /work (375, light)                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/03-work/docs/plans/slice-03-screens/work-1440-dark.png?raw=true)   | ![](https://github.com/Kynot54/portV3/blob/slice/03-work/docs/plans/slice-03-screens/work-375-light.png?raw=true)   |
| **Project page (1440, dark)**                                                                                       | **Project page (375, light)**                                                                                       |
| ![](https://github.com/Kynot54/portV3/blob/slice/03-work/docs/plans/slice-03-screens/detail-1440-dark.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/03-work/docs/plans/slice-03-screens/detail-375-light.png?raw=true) |

## Test evidence

| Check                                                          | Result                                                                                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                                      | pass                                                                                                                                |
| Unit (Vitest)                                                  | **86 passed**                                                                                                                       |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox)     | **258 passed** ×2, plus Work tests ×10 (250/250)                                                                                    |
| axe, every route including all 5 project pages, light and dark | 0 violations                                                                                                                        |
| Lighthouse (9 URLs, median of 3)                               | Accessibility **100** everywhere. Performance 98–100: across runs a single 98 moves between pages (LCP noise), above the 0.95 floor |
| Keyboard pass (/work and project pages, 1440 and 375)          | Nav → cards or "← All work" → footer; ring on every stop; no console errors                                                         |

## TODO(kyle) placeholders

- **The 5 media slots:** a screenshot or short clip per project. Real media will support `next/image`, and for video a pause button and a reduced-motion still.
- **Carried over:** the meta description, the favicon, `/blog` (04), `/contact` (05), the Services copy.

## Needs Kyle's call

- **Line break in "GPT-3.5":** on phones, the AI Mind Companion summary can break after the hyphen in "GPT-3.5". It's cosmetic and fixable with a non-breaking hyphen if you'd like.

## Conflicts flagged

1. **Unknown `/work/...` addresses** show the "Page not found" page with `noindex`, but HTTP status **200**, not 404. Next 16 with Cache Components sends the prerendered page shell before the existence check (documented behaviour). A true 404 status would need a Proxy running on every request. Visitors see the same not-found page, and search engines won't index it.

## Test-only notes

- **WebKit:** it logs a Next.js link prefetch cancelled by a reload or navigation as a console error. The "no console errors" check now ignores **only** that exact message, in WebKit only.
- **Mis-cased addresses** such as `/work/Control-BH` are checked on Linux (CI) only. macOS's case-insensitive disk serves the real page locally.

## Deferred minor findings (carried, still open)

**From Slice 02:**

- Accent arrow read aloud as "right arrow".
- Hardcoded SVG clip ids.
- The CSS-zoom test.
- Animation runs while off-screen.
- `#work` focus not asserted.

**From Slice 01:**

- The next-themes flash when storage is blocked.
- No `color-scheme` without JavaScript.
- Calendar-invalid dates.
- WebKit tab-order tests skipped.
- The shadcn `link` button variant's contrast.
- CI runs twice per PR.
- The page-wide Escape listener.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
