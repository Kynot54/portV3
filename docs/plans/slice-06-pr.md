## ⚠️ Merging deploys to production

Merging puts on `kwhynott.dev`:

- the new descriptions and preview cards
- `robots.txt` and `sitemap.xml`
- security headers on every page

Then run the **live checklist** below. It's the part only a real browser and your accounts can check.

## Summary

- **Descriptions** on every page, all 100–160 characters, so LinkedIn's "at least 100 characters" warning is gone.
  - **Site and Home:** "I'm Kyle Whynott, an AI and software engineer. I've built AI document pipelines for 50+ clients and taught machine learning at Cal State Fullerton." The facts test maps "50+ clients" to the résumé.
  - **Work, Blog and Contact:** their own descriptions (below).
  - **Projects:** the approved summary plus context line, trimmed at a word.
  - **Posts:** the summary, topped up with the first paragraph when it's short.
- **Search and sharing tags** on every page, built by one helper (`pageMetadata`), so no page drops the shared tags:
  - canonical link (`https://kwhynott.dev/…`, even on previews)
  - Open Graph: title, description, url, site name, type, and `article` with a date for posts
  - X/Twitter large card
- **Preview cards** (`og:image`) for every page: 1200×630, built at build time with Next's built-in generator, using Geist (OFL, committed) and no new package. LinkedIn's "add an og:image" warning is gone.
- **`robots.txt`:** allows everything except `/api/` and points to the sitemap.
- **`sitemap.xml`:**
  - **Always:** Home, Work, every project, Contact.
  - **Since your post exists:** Blog and your post, with its date.
  - **Never:** `/services` (unless switched on), `/blog/none`, sample posts, `/api`.
- **Security headers** on every response:
  - **The policy:** allows only the site itself, plus Turnstile, Cal.com and Cloudflare Web Analytics. It blocks plugins and stops other sites from framing the pages.
  - **Also sent:** HTTPS-only (HSTS), no content-type sniffing, a strict referrer policy and permissions policy.
  - **Pages stay prebuilt**, and Lighthouse is still 100.
  - **Previews also allow Vercel's toolbar.**

Design: `docs/superpowers/specs/2026-11-26-slice-06-launch-design.md`. Plan: `docs/plans/slice-06.md`.

## Preview URL

https://portv3-git-slice-06-launch-kynot54s-projects.vercel.app (sign in to Vercel)

## Preview cards

| Home                                                                                                           | Project                                                                                                           | Post (sample)                                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/06-launch/docs/plans/slice-06-screens/card-home.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/06-launch/docs/plans/slice-06-screens/card-project.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/06-launch/docs/plans/slice-06-screens/card-post.png?raw=true) |

## Test evidence

| Check                                                      | Result                                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                                  | pass                                                                                                                                                                                                                                          |
| Unit (Vitest)                                              | **231 passed**: descriptions are 100–160 and exact, trimming, metadata, sitemap gating, and the exact production policy, plus its preview and local variants                                                                                  |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox) | **433 passed with the headers on**. Every route's tags, every card is a real 1200×630 PNG, robots and sitemap contents, header presence. The contact (Turnstile and Cal stand-ins), theme and blog flows ran with **no "Refused to…" errors** |
| axe, every route and state                                 | 0 violations                                                                                                                                                                                                                                  |
| Lighthouse (11 URLs, 3 runs each, headers on)              | **100 in every category**                                                                                                                                                                                                                     |
| Live (Cloudflare)                                          | `www.kwhynott.dev/blog` → `kwhynott.dev/blog` (path and query kept); `http` → `https`                                                                                                                                                         |
| Keyboard                                                   | Covered by the e2e keyboard tests from Slices 1–5; nothing interactive changed in this slice                                                                                                                                                  |

## Live checklist (after merging, about 5 minutes)

1. **LinkedIn Post Inspector** (`linkedin.com/post-inspector`): inspect `https://kwhynott.dev` and one project. There should be **no warnings**, and the card image should show.
2. **Google Search Console:**
   - **Sitemaps:** submit `https://kwhynott.dev/sitemap.xml`.
   - **URL Inspection** on `/`: Test live URL → "URL is available to Google".
3. **On live `/contact`, open DevTools → Console**, then:
   - send yourself a test message
   - press **Book a call**
   - switch the theme

   There should be **no red "Refused to…" errors**. This is the one check that covers the real Cal.com embed and Cloudflare's analytics beacon, which tests can't load.

4. If anything is blocked, tell me which "Refused to…" line appears. Allowing that origin is a one-line change.

## Needs Kyle's call

- **Description copy:**
  - **Site and Home:** above.
  - **Work:** "Selected projects I've built and shipped, from AI document pipelines to full-stack apps, each with its context, what I built, the result, and what I learned."
  - **Blog:** "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended."
  - **Contact:** "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days."

  I shortened the Work line from the plan's 163 characters to 157, so it fits search results.

- **Card layout** (screenshots above).
- **Favicon** (`src/app/icon.svg`, still `TODO(kyle)`): keep the KW mark, or swap in a designed one.
- **The five project screenshots:** still "Preview coming soon" (`TODO(kyle)`). The site is complete without them.

## Conflicts flagged

None.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
