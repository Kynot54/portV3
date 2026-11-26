# Slice 06 — Launch polish: Design

**Date:** 2026-11-26 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md`. Builds on the Slice 1–5 designs and their "Notes for Slice 6" (`docs/plans/slice-04-pr.md`, `slice-05-pr.md`).

## Intent

kwhynott.dev is live. Hiring managers will meet the link mainly on **LinkedIn and Google** (Kyle). This slice makes the site:

- **Findable:** Google can crawl and index it.
- **Shareable:** a pasted link shows a real card.
- **Hardened:** security headers on every response.
- **Verified:** the live site passes a final audit.

LinkedIn's Post Inspector reached the site (2026-11-26) and warned that:

- "the description should be at least 100 characters"
- "add an og:image tag"

Both are fixed here.

## Done outside the code (Kyle, 2026-11-26)

- **LinkedInBot and Google reach the site.** Post Inspector fetched the page, and Search Console is verified by a TXT record (results take about a day).
- **`www`:** a CNAME (proxied) plus the Cloudflare redirect rule `https://www.kwhynott.dev/*` → `https://kwhynott.dev/${1}` (301, query kept). Verified: the path and query are kept, and `http://www` → `https://` → the apex.
- **Cloudflare stays in front of Vercel** (deliberate). Vercel's challenge still answers non-browser clients with 429. Verified bots and browsers pass.

## Goals

1. **Site description** (Kyle to sign off in the PR), 147 characters, first person, résumé facts only:
   > "I'm Kyle Whynott, an AI and software engineer. I've built AI document pipelines for 50+ clients and taught machine learning at Cal State Fullerton."

   It replaces the `TODO(kyle)` root description and becomes Home's description. It joins the facts test (the "50+ clients" claim maps to the résumé).
2. **Per-page metadata:**
   - **Fields:** every page sets its own `title`, `description` and **canonical URL** (`alternates.canonical`).
   - **Existing sources:** work and post pages already take title and summary.
   - **New descriptions:** `/work`, `/blog` and `/contact` each get a ≥ 100-character first-person description (copy in the PR for sign-off).
   - **Canonical:** a post's own page is the canonical copy, ahead of the inline copy on `/blog`.
   - **Open Graph and Twitter:** `og:title`, `og:description`, `og:url`, `og:type` (`website`, or `article` for posts, with `publishedTime`), `og:site_name` "Kyle Whynott", `og:image`, `twitter:card` `summary_large_image`.
3. **Preview cards (`og:image`), one per page,** made at build time with Next's built-in image generator (`next/og` `ImageResponse`; no new package). Size 1200×630, PNG, dark only (shared cards look the same for everyone):
   - **Top left:** "KW" in Geist bold, white.
   - **Middle:** the page title in large white Geist bold, wrapping to two or three lines.
     - Home uses the hero line "I'm Kyle Whynott, an AI engineer."
     - Work, Blog and Contact use their h1.
     - Projects and posts use their titles.
   - **Bottom row:** a neon-green dot (#39FF14, the open-to-work accent) plus "Kyle Whynott · AI / Software engineer" in grey (#8A8A8A) on the left, "kwhynott.dev" on the right.
   - **Fonts:** Geist from the repo or a build-time download, never fetched at request time.
   - **Alt text:** "<title>, Kyle Whynott".
4. **`robots.txt`** (`app/robots.ts`): allow all, disallow `/api/`, and point to the sitemap.
5. **`sitemap.xml`** (`app/sitemap.ts`), absolute URLs on `https://kwhynott.dev`:
   - **Always:** `/`, `/work`, each project, `/contact`.
   - **Only when published posts exist:** `/blog` and each post (using `getBlogPosts`, with the same gating as the nav).
   - **Never:** `/services` unless `SERVICES_ENABLED=true`, `/blog/none`, sample posts, `/api/*`.
   - **`lastModified`:** a post's date. Other pages carry none (no invented dates).
6. **Security headers** on every response (Kyle chose a fixed policy, "A"):
   - **`Content-Security-Policy`:**
     - `default-src 'self'`
     - `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.cal.com`
     - `style-src 'self' 'unsafe-inline'`
     - `img-src 'self' data: https:`
     - `font-src 'self'`
     - `connect-src 'self' https://challenges.cloudflare.com https://app.cal.com https://cal.com`
     - `frame-src https://challenges.cloudflare.com https://app.cal.com https://cal.com`
     - `frame-ancestors 'none'`
     - `object-src 'none'`
     - `base-uri 'self'`
     - `form-action 'self'`
     - `upgrade-insecure-requests`
   - **Other headers:**
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
     - `X-Frame-Options: DENY`

   The builder confirms Cal.com's real origins (script, iframe, API) and adds any that are missing, without wildcards.
7. **Launch audit:**
   - **Local:** the full quality bar (axe zero in both themes on every route and state, Lighthouse 100 with the new headers), plus a manual keyboard pass.
   - **Live smoke check:** a script Kyle or CI can run against `https://kwhynott.dev`. It runs as a browser, because Vercel challenges curl. It checks:
     - status codes for every sitemap URL
     - 404 for `/services`, `/blog/none` and an unknown path
     - the headers present
     - `og:image` reachable
     - `robots.txt` and `sitemap.xml` served
     - `www` → apex keeps the path

## Non-goals

- Changing Vercel or Cloudflare settings (Kyle's).
- Analytics.
- Structured data beyond basic metadata. `Person` JSON-LD could come later.
- RSS.
- A redesign.
- The admin.

## Anti-goals

- A card or description that states anything not on the résumé.
- A header that breaks Turnstile, the Cal.com embed or the theme script in any browser.
- Hidden or sample pages in the sitemap.
- Lighthouse dropping below the gate.

## Constraints

- No new packages (`next/og` ships with Next).
- Pages stay pre-built: no nonces, no per-request rendering for headers. Headers are set in `next.config.ts` `headers()`.
- Copy is a joint call: every new description and the card wording go in the PR under "Needs Kyle's call".

## Approaches considered

| | Approach | Trade-off | Outcome |
| --- | --- | --- | --- |
| Security policy | **A. Fixed policy for every page** | Allows inline scripts (Next and the theme switcher need them); pages stay static and fast | **Chosen by Kyle** |
| | B. Per-request nonce | Strongest, but forces dynamic rendering of every page (Next docs); slower, Lighthouse risk | Rejected |
| | C. SRI (experimental) | Covers files only; inline scripts still need A's allowance | Rejected |
| Preview cards | **A. One card per page, built at build time** | Each shared link shows its own title | **Chosen by Kyle** |
| | B. One site-wide card | Every link looks the same | Rejected |
| | C. Kyle-designed images | His time, per post | Rejected |

## Calls from the builder check (mine; Kyle can overrule in the PR)

- **Descriptions of 100+ characters on every page, with no new copy.**
  - Project pages use the approved `summary` plus `context`, trimmed at a word boundary to about 160 characters.
  - Posts use `summary`, and fall back to `summary` plus the first paragraph when it's under 100.
  - A content test fails if any live page's description is under 100 characters. Sample posts are excluded.
- **Live smoke check.** Vercel's challenge also stops headless browsers (verified 2026-11-26: a headless Chromium got the Security Checkpoint). So an automated check against the live site isn't possible.
  - The check is a short **manual checklist for Kyle** in the PR: LinkedIn Post Inspector, Search Console, the browser console on `/contact` with Book a call, and `www`.
  - Plus a curl check of the parts Cloudflare answers itself: the `www` redirect and `robots.txt`.
  - The full audit runs locally against a production build, as in every slice.
- **Cal.com origins.** E2E stubs Cal.com, so the policy uses Cal.com's documented embed origins (`app.cal.com` for the script and iframe, `cal.com`). Kyle confirms there are no CSP errors when he presses Book a call on the preview (checklist).
- **The policy differs only where it must.**
  - **Vercel previews** also allow `https://vercel.live`, for Vercel's preview toolbar.
  - **Local and test builds** (not on Vercel) leave out `upgrade-insecure-requests`, because tests run over `http://localhost` and WebKit would upgrade them.
  - A unit test pins the exact production policy.

## Left for Kyle (listed in the PR)

- Favicon sign-off (`src/app/icon.svg`, `TODO(kyle)`).
- The five project screenshots (`TODO(kyle)`). The site launches with the placeholders.
- Signing off the description and card copy.

## Left to the builder

- File layout for the card generator (a shared template plus per-route `opengraph-image.tsx`, or one generator).
- How the smoke check is packaged (a Playwright project gated by an env var, or a script).
- Exact Cal.com CSP origins, verified against the embed's real requests in e2e.
