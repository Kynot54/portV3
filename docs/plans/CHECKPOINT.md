# Checkpoint: resume here

**Updated:** 2026-11-26 · **Branch:** `slice/02-home` (from `main` @ `04bac7b`, which includes merged PR #1)

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

1. **Builder check: done.** Two questions are waiting for Kyle's answers. Then update the design doc and ask Kyle to approve it.
   - **Q1:** does the grain sit behind the hero text, or only in a band below the CTAs and proof line? Recommended: **a band below**. The grain behind muted text fails contrast in light mode (#6B6B6B on #d4d4d4 is about 3.6:1).
   - **Q2:** what are the `<h2>` headings for the About and closing contact sections? Recommended: **"About"** and **"Contact"**.
   - Q3 is settled and recorded in the doc: `summary` = the card line, and each body is a `TODO(kyle)` stub.
2. **Once Kyle approves the design**, use the `superpowers:writing-plans` skill to write `docs/plans/slice-02.md`. Then ask how to run it (Native or subagent-driven). Kyle used Native for Slice 1.
3. **Build**, with `superpowers:executing-plans`. Follow the Slice 1 pattern:
   - a progress ledger in `.superpowers/sdd/`
   - a duplicate-file scan before each task
   - TDD
   - commit and push each task
   - an independent whole-branch review at the end
   - a PR with the description in `docs/plans/slice-02-pr.md`

## Open issue that needs Kyle (not code)

- **`kwhynott.dev` redirected to a Vercel login page** when checked on 2026-11-26, so the live V2 site isn't public. The likely fix is Kyle's: Vercel → `portfolio` project → Settings → Deployment Protection → **Standard Protection**. After any change, re-check with `curl -sI https://kwhynott.dev` (expect a 200, not a 302 to `vercel.com/sso-api`).

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
