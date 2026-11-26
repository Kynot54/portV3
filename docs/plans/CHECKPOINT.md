# Checkpoint: resume here

**Updated:** 2026-11-26 (end of day) · **Branch:** `slice/06-launch` (from `main` @ `f1ebff2`). Everything below is committed and pushed.

## To resume

Open a session in `~/Projects/portV3` and say:

> "Resume from docs/plans/CHECKPOINT.md."

## Where we are

- **Slice 1 (Foundation)** is merged (PR #1).
- **Slice 2 (Home)** is merged (PR #3) and live on `kwhynott.dev`. Kyle merged without changing the PR's "Needs Kyle's call" items, so those defaults stand. Revisit them only if he raises them: section spacing, the visual's size on phones, card labels, hairline joints, two wave points, inset band, grain density.
- **Dependabot:**
  - PR #2 bundles breaking majors (TS 7 fails CI, ESLint 10, `@types/node` 26). Recommended: close it unmerged.
  - PR #4 (`chore/dependabot-safe-updates`) groups minor and patch updates and holds those majors. Kyle merges it.

## Next steps, in order

1. **Slice 6 (launch polish): PR #10 is ready for Kyle.** Review and fix pass done: the full Vercel toolbar policy on previews, and `font-src https://cal.com` (found with a local check of the real embeds in WebKit). `browsing-topics` is dropped, no build allows eval (Kyle), and `.env.development` holds public test values. Optional `description` field on projects and posts, and the new Home description. Unit 236, e2e 433.
   - **Kyle:** approve the copy, cards and alt text, merge, then run the live checklist in PR #10.
   - **Env vars are Production-only**, so check real embeds locally (README), never on a preview.
2. **Open `TODO(kyle)`:** the favicon sign-off and the five project screenshots.
3. **After Slice 6:** V3 is complete. V3.1+ covers the admin, cross-posting and consulting.

## Live-site facts (2026-11-26)

- **Cloudflare:**
  - It proxies in front of Vercel, deliberately.
  - Web Analytics is ON (beacon `static.cloudflareinsights.com`), Rocket Loader is OFF, and Cloudflare sends no HSTS.
  - The `www` redirect rule is `https://www.kwhynott.dev/*` → `https://kwhynott.dev/${1}` (301, query kept). Verified.
- **Vercel's challenge** answers curl and headless browsers with 429. Real browsers pass. LinkedInBot reached the site (Post Inspector), and Google Search Console is verified by TXT. So live checks are manual.
- **Contact (Slice 5)** is live and verified by Kyle: email arrives, Cal.com loads, Turnstile has no `localhost`, and `portv3` previews keep Vercel Authentication.

## Done

- **Slices 1–5** are merged (PRs #1, #3, #5, #7, #9) and live, along with the first post (PR #8). Blog is in the nav. The Blog is hidden on production until Kyle's first post, so the nav reads Work, Contact.

## Notes on the live site

- **The Vercel login wall on `kwhynott.dev` is fixed** (Kyle, 2026-11-26). Anonymous requests no longer redirect to `vercel.com/sso-api`.
- **Vercel's "Security Checkpoint" bot challenge is active** on `kwhynott.dev`: non-browser clients get `429` plus a challenge page. Browsers pass it. Revisit in Slice 6, because it can block search crawlers and link previews (LinkedIn, Slack).
- **`kwhynott.dev` serves V3 by Kyle's choice** (V2 is scrapped). **Every merge to `main` is a production deploy.**

## Environment notes (this machine)

- **npm:** set `npm_config_cache=$TMPDIR/npm-cache`, because the sandbox blocks `~/.npm`.
- **Outside the sandbox:** `next build`, Playwright, Lighthouse, `git` writes and `gh` calls (fonts, ports and `.git`).
- **Tests:**
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
