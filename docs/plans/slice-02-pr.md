## ⚠️ Merging deploys to production

`kwhynott.dev` serves V3 from `main` (V2 is retired), so **merging this PR publishes the new Home page to the live site.**

## Summary

Slice 02 replaces the Home placeholder with the approved page. In order:

1. **Hero:**
   - the "Open to work · AI / Software Engineer" label, with the accent dot
   - the heading "I'm Kyle Whynott, an AI engineer." and the three-sentence lead
   - **Get in touch →** (accent, `/contact`) and **See my work** (quiet, `#work`)
   - the proof line: _Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering_
2. **The "three eras" visual:** a band below the hero where one hairline runs from an analog wave to a digital square wave and into an AI network.
   - **Built with:** pure SVG + CSS, with no client JavaScript and no new packages.
   - **Look:** the grain is fine and dim. Only the small travelling points use the accent.
   - **Reduced motion:** for visitors who've turned on reduced motion, everything stops on a composed still frame.
3. **Selected work:** three real entries from `content/work/`, each card linking to `/work` until Slice 03:
   - AI document pipelines
   - C.O.N.T.R.O.L. BH
   - Ulti-Health
4. **About**, in Kyle's approved words. The analog → digital → AI experience is shown, with no generational label.
5. **Contact:** "I'm looking for my next role as an AI or software engineer. Let's talk." plus **Get in touch →**.

Also included:

- **`resume.md`:** the Ulti-Health entry is rewritten to its real MVP stack (Expo + Supabase).
- **Work loader:** gains `featured`, `order` and `label`, and a missing field fails the build.
- **Facts test:** every number on Home maps to its exact source phrase in the resume.

The design is in `docs/superpowers/specs/2026-11-26-slice-02-home-design.md` and the plan in `docs/plans/slice-02.md`.

## Preview URL

https://portv3-git-slice-02-home-kynot54s-projects.vercel.app (sign in to Vercel to view the preview)

## Screenshots

|      | Dark                                                                                                                            | Light                                                                                                                             | Reduced motion (still)                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1440 | ![hero-1440-dark](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-1440-dark.png?raw=true) | ![hero-1440-light](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-1440-light.png?raw=true) | ![hero-1440-dark-still](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-1440-dark-still.png?raw=true) |
| 375  | ![hero-375-dark](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-375-dark.png?raw=true)   | ![hero-375-light](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-375-light.png?raw=true)   | ![hero-375-dark-still](https://github.com/Kynot54/portV3/blob/slice/02-home/docs/plans/slice-02-screens/hero-375-dark-still.png?raw=true)   |

**Lighthouse HTML reports and the Playwright report** are attached to every CI run as the `reports` artifact (Actions → the run → Artifacts).

## Test evidence

| Check                                                      | Result                                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                                  | pass                                                                                                                   |
| Unit (Vitest)                                              | **74 passed**                                                                                                          |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox) | **182 passed** ×2, plus Home tests ×10 (410/410), with no flakes                                                       |
| axe, every route, light and dark, mobile menu open         | 0 violations, no waivers                                                                                               |
| Lighthouse (median of 3, mobile emulation)                 | **100 / 100 / 100 / 100** on `/`, `/work`, `/blog` and `/contact`                                                      |
| Keyboard pass (1440 and 375, both themes)                  | Skip → logo → nav → hero buttons → 3 cards → Contact button → GitHub → LinkedIn; ring on every stop; no console errors |

New tests cover:

- the copy, verbatim
- the button targets
- section order and the `#work` jump landing below the nav
- the visual being decorative, animating by default and fully still under reduced motion
- the visual sitting below the proof line at 320, 375 and 1440 px and at 200% zoom
- a fixed band height (no layout shift)
- accent used only on the points
- hero text wrapping (the dot stays with its label, and proof items stay whole)
- the facts check: every number on Home (cards, proof line, About) must sit inside a claim mapped to its exact resume phrase (for example "Manual review dropped 50%" maps to "manual review down by 50%"), so a changed number fails

## TODO(kyle) placeholders

- `content/work/{ai-document-pipelines,control-bh,ulti-health}.mdx`: detail copy for the Slice 03 project pages
- Carried over: the meta description, the favicon, `/work` (03), `/blog` (04), `/contact` (05), the Services copy, the blog placeholder post

## Needs Kyle's call

- **Section spacing:** each section pads top and bottom, so the gap between sections is about 190 px at desktop. Tighten it if it feels sparse.
- **The visual on phones:** it scales to fit the width, so at 375 px the drawing is small inside its band. It can be made larger on phones by cropping the edges, if you'd like.
- **Card labels** ("AI · 2025–26" and so on) come from the resume dates and the project type.

## Conflicts flagged

1. **Accent uses on Home:** the Contact pill, both **Get in touch** buttons, the open-to-work dot, and the travelling points in the visual. Slice 01's rule was "three uses only". Kyle approved the repeated main call to action and the points in the design.
2. **The site's one continuous animation** is the hero visual. It's slow, never flashes, and stops completely under reduced motion.

## Independent review

A fresh reviewer read the whole branch: no critical findings, three important ones, and eleven minor ones. Fixed here, each with a test that failed first:

- At 320 px the proof line overflowed its box into the gutter. Measured in Chromium (`overflow: true` on the old code). Items now wrap inside themselves below 640 px.
- The facts test only checked that "50" appeared somewhere in the resume. It now checks exact source phrases, across the cards, proof line and About.
- Missing PR evidence: the screenshots and report link above.
- Re-graded from minor: project titles weren't headings, so screen-reader heading navigation skipped the projects. They're now `<h3>`, and the list keeps its list role in Safari.

**For your call (design details from the approved concept):**

- The hairline has small breaks where the wave meets the square wave, and where the square wave meets the network. Should those be tied into one continuous line?
- Two points ride the analog wave at once, where the spec said one.
- The band is inset by the page gutter (with soft faded edges) rather than truly edge to edge.
- On white, the grain may read as a flat light-grey tint. A sparser grid is easy if so.

**Deferred minor findings (new in this slice):**

- No explicit `cacheLife("max")` on the Home data, so Next re-renders every 15 minutes even though content only changes on deploy. If content tracing ever broke, Selected work would show empty instead of failing.
- "Get in touch →" is read aloud as "…right arrow".
- The SVG clip-path ids are hardcoded (harmless with one instance).
- The 200% zoom test uses CSS zoom; the real reflow check is the 320 px test.
- The animation repaints each frame and keeps running off-screen. The dark-mode glow filter adds cost. No score impact today.
- The `#work` jump is checked for scroll position, not focus position.

## Deferred minor findings (carried from Slice 01, still open)

- `localStorage` blocked with a light OS shows a dark-to-light flash (a next-themes limit).
- No `color-scheme` without JavaScript.
- Calendar-invalid dates pass the loader.
- WebKit Tab-order tests are skipped.
- The unused shadcn `link` variant is 3.7:1 in light mode.
- CI runs twice per PR push.
- The menu's Escape listener is page-wide.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
