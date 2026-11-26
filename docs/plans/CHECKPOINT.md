# Checkpoint: resume here

**Updated:** 2026-11-26 (end of session) · **Branch:** `slice/03-work` (from `main` @ `9ecb6fc`, which includes merged PRs #1 and #3). Everything below is committed and pushed.

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

1. **Slice 3 (Work) is complete; PR #5 is open and waiting for Kyle:** https://github.com/Kynot54/portV3/pull/5. The whole-branch review is done and its fixes are in (`3b05c88`): a real 404, a stricter facts test, a 44 px back link, and a required label. Lighthouse is 100 on all 9 URLs. **Merging deploys to production** (including Home's 10+ → 50+ change). After the merge: Slice 4 (Blog) starts with brainstorming. The MDX renderer (`src/lib/mdx.tsx`) is already in place.
2. Kyle merges PR #4 and closes #2. Dependabot should then open a safe-only PR. Review it once its CI is green.

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
