# Checkpoint: resume here

**Updated:** 2026-11-26 (end of session) · **Branch:** `slice/02-home` (from `main` @ `04bac7b`, which includes merged PR #1). Everything below is committed and pushed.

## To resume

Open a session in `~/Projects/portV3` and say:

> "Resume from docs/plans/CHECKPOINT.md."

## Where we are

**Slice 1 (Foundation) is merged** (PR #1, all checks green). Its design is in `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md`.

**Slice 2 (Home) is in brainstorming, with the design written.** Every decision has Kyle's approval, and the design doc records them all: **`docs/superpowers/specs/2026-11-26-slice-02-home-design.md`**.

- The copy is approved: hero, proof line, the three work cards, About, the contact CTA, and the `resume.md` Ulti-Health rewrite.
- The hero visual is **B, "three eras"** (analog wave → digital square wave → AI network), built as **option D: SVG + CSS, no JavaScript**. It animates, and holds still under `prefers-reduced-motion`.
- The approved v2 mockup is in `.superpowers/brainstorm/41338-1795658600/content/hero-visual-v2.html` (git-ignored, local only).

## Next steps, in order

1. **Slice 2 is built, and PR #3 is open:** https://github.com/Kynot54/portV3/pull/3. Tasks 1–5 are done; Task 6 is in progress.
   - **Whole-branch review:** a fresh reviewer was dispatched when this was written. If its result is lost, run it again: use the review package in `.superpowers/sdd/slice-02/`, or rebuild it with `review-package docs/plans/slice-02.md <merge-base> HEAD`, plus the code-reviewer prompt.
   - **Then:** fix the Critical and Important findings, each with a failing test first, in one pass. List the minors in the PR. Update this checkpoint.
   - **Waiting on Kyle:** review the preview (`portv3-git-slice-02-home-kynot54s-projects.vercel.app`) and decide the PR's "Needs Kyle's call" items: section spacing, the visual's size on phones, and the card labels. **Merging deploys to production.**
2. **Dependabot PR #2** ("Bump the npm group with 7 updates") is open. Review it separately: let CI run, check for breaking majors, and Kyle merges.
3. **After the merge:** Slice 3 (Work: list and detail pages using the three entries) starts with brainstorming.

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
