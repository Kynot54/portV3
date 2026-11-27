# Checkpoint: resume here

**Updated:** 2026-11-27 · **Branch:** `main` (Slice 8 and its fixes merged, PRs #16 and #17). V3 is live; Services is built and hidden. The only V3 step left is the real project media.

## To resume

Open a session in `~/Projects/portV3` and say:

> "Resume from docs/plans/CHECKPOINT.md."

## Where we are

- **Slices 1–8 are merged and live** (PRs #1, #3, #5, #7, #9, #10, #13, #16), along with their follow-ups (#12, #15, #17) and the first post (#8).
- **Project media (Slice 8):** cards show a thumbnail and play a clip on hover or focus (mouse only, and never with reduced motion). Project pages show two images, plus a clip under "See It in Action" when there is one. Every real project still shows the "Preview coming soon" placeholder until Kyle adds files.
- **Dependabot:** PR #6 (minor and patch updates) is open. Kyle merges it if CI is green. PR #2 was closed unmerged, and #4 was merged.

## Next steps, in order

1. **Real media: the last V3 step.** Kyle adds each project's files to `public/images/work/<slug>/` (spec in the README: two images, plus an optional silent MP4 clip). Then I:
   - check every file against the spec;
   - run all tests and Lighthouse, and check phone, tablet and desktop widths;
   - open a follow-up PR with alt text and clip descriptions for his approval.

   V3 is done when that PR merges. Revisit clip hosting if traffic surges (clips are served from Vercel).

2. **After V3 is done:** test Kyle's personal skills on fresh agents, with and without each one. They are `working-with-kyle`, `writing-copy-for-kyle` and `closing-work-for-kyle`, in `~/.claude/skills/`, and they apply to any project (Kyle, 2026-11-27). They are not in this repo.
3. **V3.1 (Kyle, 2026-11-27):**
   - **Launch Services:** set `SERVICES_ENABLED=true`, redeploy, then run PR #13's live checklist (Safari booking, both calendars in one visit, a test message arriving as "Services:").
   - **Cross-posting** to LinkedIn, Medium and X. Posts are still added through manual PRs, with no admin.

## Live-site facts (2026-11-26)

- **Cloudflare:**
  - It proxies in front of Vercel, deliberately.
  - Web Analytics is ON (beacon `static.cloudflareinsights.com`), Rocket Loader is OFF, and Cloudflare sends no HSTS.
  - The `www` redirect rule is `https://www.kwhynott.dev/*` → `https://kwhynott.dev/${1}` (301, query kept). Verified.
- **Vercel's challenge** answers curl and headless browsers with 429. Real browsers pass. LinkedInBot reached the site (Post Inspector), and Google Search Console is verified by TXT. So live checks are manual.
- **Contact (Slice 5)** is live and verified by Kyle: email arrives, Cal.com loads, Turnstile has no `localhost`, and `portv3` previews keep Vercel Authentication.

## Done

- **Slices 1–6** are merged and live, and Kyle confirmed the Slice 6 live checklist (2026-11-26).
- **Slice 7 (Services)** is merged and hidden (`SERVICES_ENABLED=false` in Production). The real consultation event is verified.
- **Slice 8 (media)** is merged, along with the deferred fixes (#17). On 2026-11-27, every definition-of-done item was checked with evidence: CI green, Lighthouse accessibility 100 on all 13 URLs, Kyle's manual keyboard pass on every page, and booking confirmed in real Safari.

## Notes on the live site

- **The Vercel login wall on `kwhynott.dev` is fixed** (Kyle, 2026-11-26). Anonymous requests no longer redirect to `vercel.com/sso-api`.
- **Vercel's "Security Checkpoint" bot challenge is active** on `kwhynott.dev`: non-browser clients get `429` plus a challenge page. Browsers pass it. LinkedInBot and Google reach the site (see Live-site facts).
- **`kwhynott.dev` serves V3 by Kyle's choice** (V2 is scrapped). **Every merge to `main` is a production deploy.**

## Environment notes (this machine)

- **npm:** set `npm_config_cache=$TMPDIR/npm-cache`, because the sandbox blocks `~/.npm`.
- **Outside the sandbox:** `next build`, Playwright, Lighthouse, `git` writes and `gh` calls (fonts, ports and `.git`).
- **Tests** (e2e send tests wait with `formReady()` in `tests/e2e/third-party.ts`; never use a fixed sleep):
  - `npm run lint && npm run format:check && npm run typecheck && npm test`
  - `npm run test:e2e` (Playwright on port 3100)
  - `npm run lhci` (Lighthouse on port 3200)
- **Vercel:**
  - **`portv3`:** the V3 previews, at `portv3-git-<branch>-kynot54s-projects.vercel.app`, behind Vercel login.
  - **`portfolio`:** serves `kwhynott.dev`; Kyle set it to build previews only.
  - Never change Vercel production or domain settings.
- **GitHub:** `main` is protected (the `quality` check is required). `gh` has the `workflow` scope.

## Kyle's working preferences

- **Copy:** objective, in his voice, short sentences, plain words, no selling adjectives, no generational labels. Facts only from `content/source/resume.md`.
- **Skills:** keep the superpowers and mattpocock skill sets separate. Flag with "▶ You run:" whenever a step needs a skill only he can type, such as `/mattpocock-skills:grill-me`.
- **Decisions:** when his direction conflicts with the brief, follow it and flag it in the PR under "Conflicts flagged". The "Never do" list stays his alone.
