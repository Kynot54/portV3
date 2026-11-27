# Checkpoint: resume here

**Updated:** 2026-11-27 · **Branch:** `slice/07-services` (from `main` @ `5c2aa65`). V3 is live; Slice 7 adds Services.

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

1. **Slice 7 (Services): PR on `slice/07-services` is ready for Kyle.** Design: `docs/superpowers/specs/2026-11-26-slice-07-services-design.md`; plan: `docs/plans/slice-07.md`.
   - **Kyle:** review "Needs Kyle's call" in the PR (step 4's wording, the founder form examples, two accent buttons), merge, then run its live checklist.
   - **Production env:** `SERVICES_ENABLED=true` and `NEXT_PUBLIC_CAL_CONSULT_LINK` (Kyle set both, 2026-11-27). A production build with Services on fails without the link.
   - **Decided:** Services is consulting for non-technical founders (websites, custom software, AI automation, team training). No payments, scheduling, work orders or admin. Posts stay committed MDX (no admin). Placement B: not in the nav.
2. **Open `TODO(kyle)`:** the five project screenshots. Kyle adds them to `public/images/work/<slug>.png` (specs in the README), then wire them in with next/image and alt text for his approval.
   - **Env vars are Production-only**, so check real embeds locally (README), never on a preview.
3. **Later:** cross-posting to LinkedIn, Medium and X.

## Live-site facts (2026-11-26)

- **Cloudflare:**
  - It proxies in front of Vercel, deliberately.
  - Web Analytics is ON (beacon `static.cloudflareinsights.com`), Rocket Loader is OFF, and Cloudflare sends no HSTS.
  - The `www` redirect rule is `https://www.kwhynott.dev/*` → `https://kwhynott.dev/${1}` (301, query kept). Verified.
- **Vercel's challenge** answers curl and headless browsers with 429. Real browsers pass. LinkedInBot reached the site (Post Inspector), and Google Search Console is verified by TXT. So live checks are manual.
- **Contact (Slice 5)** is live and verified by Kyle: email arrives, Cal.com loads, Turnstile has no `localhost`, and `portv3` previews keep Vercel Authentication.

## Done

- **Slices 1–6** are merged (PRs #1, #3, #5, #7, #9, #10) and live, along with the first post (PR #8). Kyle ran the Slice 6 live checklist and confirmed it (2026-11-26). Blog is in the nav. The Blog is hidden on production until Kyle's first post, so the nav reads Work, Contact.

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
