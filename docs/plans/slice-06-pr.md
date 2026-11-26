## ⚠️ Merging deploys to production

Merging puts on `kwhynott.dev`:

- the new descriptions and preview cards
- `robots.txt` and `sitemap.xml`
- security headers on every page

After merging, run the **live checklist** below. It's the part only your accounts and the real domain can check.

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
- **Preview cards** (`og:image`) for every page: 1200×630, made with Next's built-in generator (Home, Work, Blog and Contact at build time; each project and post card on its first request, then cached), using Geist (OFL, committed) and no new package. LinkedIn's "add an og:image" warning is gone.
- **`robots.txt`:** allows everything except `/api/` and points to the sitemap.
- **`sitemap.xml`:**
  - **Always:** Home, Work, every project, Contact.
  - **Since your post exists:** Blog and your post, with its date.
  - **Never:** `/services` (unless switched on), `/blog/none`, sample posts, `/api`.
- **Security headers** on every response:
  - **The policy:** allows only the site itself, plus Turnstile, Cal.com and Cloudflare Web Analytics. It blocks plugins and stops other sites from framing the pages.
  - **Also sent:** HTTPS-only (HSTS), no content-type sniffing, a strict referrer policy and permissions policy.
  - **Pages stay prebuilt**, and Lighthouse is still 100.
  - **Previews also allow Vercel's toolbar** (its documented origins). Production doesn't. No build allows eval, `next dev` included.

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
| Unit (Vitest)                                              | **233 passed**: descriptions are 100–160 and exact, trimming, metadata, sitemap gating, and the exact production policy, plus its preview and local variants                                                                                  |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox) | **433 passed with the headers on**. Every route's tags, every card is a real 1200×630 PNG, robots and sitemap contents, header presence. The contact (Turnstile and Cal stand-ins), theme and blog flows ran with **no "Refused to…" errors** |
| axe, every route and state                                 | 0 violations                                                                                                                                                                                                                                  |
| Lighthouse (11 URLs, 3 runs each, headers on)              | **100 in every category**                                                                                                                                                                                                                     |
| Live (Cloudflare)                                          | `www.kwhynott.dev/blog` → `kwhynott.dev/blog` (path and query kept); `http` → `https`                                                                                                                                                         |
| Keyboard                                                   | Covered by the e2e keyboard tests from Slices 1–5; nothing interactive changed in this slice                                                                                                                                                  |

## Final review

An independent reviewer read the whole branch. Verdict: ready to merge with fixes, no critical issues.

**Fixed (each test-first):**

- **Previews blocked Vercel's toolbar.** The preview policy allowed only part of Vercel's documented list, so a signed-in preview would log "Refused to…" errors. It now allows the full list (styles, fonts, images and the comments socket).
- **The real Cal.com and Turnstile check came after merging**, which is production. I ran it before handing over (above). It found the Cal.com font block, now fixed.

**Left for later (minor):**

1. The `og:image` address comes from `NEXT_PUBLIC_SITE_URL`, while canonical is fixed to `kwhynott.dev`. Setting that variable on production would point cards at another host. It's unset today.
2. Project and post cards are made on first request, not at build (now stated correctly above). The first crawler waits about a second once.
3. `/services` and 404 pages reuse Home's canonical. Harmless while they 404. Services needs its own tags when it ships.
4. The Home card's alt text reads "…an AI engineer., Kyle Whynott" (under "Needs Kyle's call").
5. The e2e tag check lists routes by hand. A future page could miss its card unnoticed.
6. HSTS covers subdomains for 2 years. That's sticky: a future plain-HTTP subdomain wouldn't load for past visitors.

**Calls I made on what the reviewer couldn't check:**

- **Cal.com's exact origins:** checked with the real embed in all three engines (above).
- **Vercel's toolbar list:** checked against Vercel's docs and fixed.
- **Other Cloudflare injections:** you have only Web Analytics on, and Rocket Loader is off. Cloudflare's other inline features would pass under the current policy anyway.
- **Slack, iMessage and Discord previews:** whether their fetchers get past Vercel's bot challenge is a Vercel setting, not code. LinkedIn and Google already pass.

## Real Cal.com and Turnstile check (done before handing over)

Previews have no env vars (production only), so a preview can't load the calendar or Turnstile. Instead, I ran a production build locally with the **real** scripts, no stand-ins, under the production policy:

- Turnstile ran with Cloudflare's public test key.
- Cal.com ran with a public demo calendar. Its origins are the same as yours.

In Chromium, Firefox and WebKit, I focused the form, pressed Book a call and switched the theme.

- **First run:** WebKit blocked `https://cal.com/cal.ttf`, a font Cal's script adds to the page. The e2e stand-ins could never have shown this. `font-src` now allows `https://cal.com`.
- **After the fix:** Turnstile's frame and the calendar loaded in all three browsers, with **no policy violations**.

## Live checklist (after merging, about 5 minutes)

1. **LinkedIn Post Inspector** (`linkedin.com/post-inspector`): inspect `https://kwhynott.dev` and one project. There should be **no warnings**, and the card image should show.
2. **Google Search Console:**
   - **Sitemaps:** submit `https://kwhynott.dev/sitemap.xml`.
   - **URL Inspection** on `/`: Test live URL → "URL is available to Google".
3. **On live `/contact`, open DevTools → Console**, then send yourself a test message and press **Book a call**. There should be **no "Refused to…" errors**. This checks your real calendar and Cloudflare's analytics beacon, which runs only behind Cloudflare.
4. If anything is blocked, tell me which "Refused to…" line appears.

## Needs Kyle's call

- **Description copy:**
  - **Site and Home:** above.
  - **Work:** "Selected projects I've built and shipped, from AI document pipelines to full-stack apps, each with its context, what I built, the result, and what I learned."
  - **Blog:** "My writing on software engineering, AI and security: how software works at its foundation, and how it fails or is defended."
  - **Contact:** "Send me a message or book a 30-minute intro call. I'm looking for my next role as an AI or software engineer and reply within 2–3 business days."

  I shortened the Work line from the plan's 163 characters to 157, so it fits search results.

- **Card layout** (screenshots above).
- **Home card alt text:** now "I'm Kyle Whynott, an AI engineer., Kyle Whynott". I'd drop the period before the comma.
- **Favicon** (`src/app/icon.svg`, still `TODO(kyle)`): keep the KW mark, or swap in a designed one.
- **The five project screenshots:** still "Preview coming soon" (`TODO(kyle)`). The site is complete without them.

## Dev setup

- **`.env.development`** (committed, public test values only) makes `/contact` work under `next dev`: Turnstile's test key, Cal.com's demo calendar, and a fake send. `next build`, Vercel, CI and the tests never load it.

## Changes to the approved design

- **`font-src` adds `https://cal.com`.** The design allowed adding Cal.com origins that the real embed needs.
- **Permissions-Policy drops `browsing-topics=()`.** Chrome removed that feature, so it logged "Unrecognized feature" on every page.

## Conflicts flagged

- **`next dev` doesn't allow eval (your call).** Next's CSP guide says dev needs `'unsafe-eval'`, because React uses it to rebuild server error stacks in the browser. The consequence: during `next dev`, the console may show "Refused to evaluate a string as JavaScript" lines, and server error stacks are less detailed. Production, previews and the tests aren't affected; a unit test pins that no build allows eval.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
