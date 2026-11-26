# Checkpoint: resume here

**Updated:** 2026-11-26 · **Branch:** `slice/04-blog` (from `main` @ `b393100`, which includes merged PRs #4 and #5). Everything below is committed and pushed.

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

1. **Slice 4 (Blog) is built; its PR is open.** The whole-branch review runs next, then its fixes, then Kyle merges. Design: `docs/superpowers/specs/2026-11-26-slice-04-blog-design.md`. Plan: `docs/plans/slice-04.md`. Ledger: `.superpowers/sdd/slice-04/progress.md`. **Merging deploys to production,** and the live nav becomes Work, Contact until Kyle's first post (option B).
2. **After the merge:** Slice 5 (Contact: form + booking) starts with brainstorming.
3. **Slice 3 (Work)** is merged (PR #5). **Dependabot PR #2** should be closed unmerged if it's still open.

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
