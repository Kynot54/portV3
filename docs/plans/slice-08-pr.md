## ⚠️ Merging deploys to production

Visible right away: **Title Case on label headings** across the site.

Project media appears only once you add each project's files. Until then, cards and project pages look as they do now.

## Summary

- **Card thumbnails:** image 1 is the still.
  - On a mouse or trackpad, the clip plays while the card is hovered or keyboard-focused, with reduced motion off.
  - It stops, rewinds and shows the still the moment the pointer or focus leaves.
  - Phones and tablets never play it.
  - Clips download only on the first hover.
- **Project page:** the two images replace "Preview coming soon". The clip sits under **See It in Action**, between Result and What I Learned. It has controls and a caption, never starts by itself, and has no sound.
- **Build checks:** each project lists its media in its frontmatter. The build fails if:
  - a file is missing, or isn't a file;
  - a file has the wrong type (images: .png/.jpg/.jpeg/.webp; clip: .mp4);
  - an image has no alt text, or there aren't exactly two images;
  - a clip has no description.
- **Title Case (Kyle):**
  - Selected Work, What I Built, What It Does, What I Learned, Built With
  - Send a Message, Book a Call
  - the Services section and card titles
  - Page Not Found

  Headlines that are sentences, project and post titles, buttons and page titles are unchanged.

- **Test-only sample project** (`WORK_SAMPLES=1`, never in production): generated stills and a tiny silent clip (`scripts/make-sample-media.mjs`), so the tests cover all of this before real media exists.
- **README:** "Adding project media" gives the file specs, the frontmatter example, and the note to revisit hosting if traffic surges.
- **No new packages and no security-policy change.**

Design: `docs/superpowers/specs/2026-11-27-slice-08-work-media-design.md`. Plan: `docs/plans/slice-08.md`.

## Screenshots (sample project)

| Card, still                                                                                                         | Card, hovered (playing)                                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/08-work-media/docs/plans/slice-08-screens/card-still.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/08-work-media/docs/plans/slice-08-screens/card-playing.png?raw=true) |

Project page: ![](https://github.com/Kynot54/portV3/blob/slice/08-work-media/docs/plans/slice-08-screens/project-page.png?raw=true)

## Test evidence

| Check                     | Result                                                                                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck | pass                                                                                                                                                                                                                                                        |
| Unit                      | **285 passed**: media validation (missing, not a file, wrong type, no alt, one image, clip without description); hover, focus and leave; touch; reduced motion, including switched on mid-play; a clip the browser can't play; leaving before play starts   |
| E2E                       | **534 passed**: hover, keyboard, reduced motion, a touch phone (never plays, a tap opens the project), switching cards, 16:9 kept while loading, page section order, axe on the sample page. Breaking the leave handler on purpose made the hover test fail |
| Lighthouse (13 URLs)      | Accessibility **100** everywhere; every other score **≥ 96**. The 96–98 dips appear on `main` too (this machine's timing)                                                                                                                                   |

## Final review

A fresh reviewer read the whole branch and found no Critical or Important issues. All five risk points hold, the sample can't reach production, and file names can't escape the project's folder.

- **Fixed:** a file name of `.` or `..`, or the wrong file type, could pass the build and show a broken image. Now it fails the build.
- **Fixed:** the README's advice to put phone apps on a 16:9 canvas is back.
- **Left for later (minor):**
  1. A very fast out-and-back on a card's first hover can leave the still showing until the next hover.
  2. Keyboard focus on one card and mouse hover on another can play two clips.
  3. The page clip's still frame downloads larger than it needs to.
  4. Two e2e checks are weak while only one sample card has a clip. Unit tests cover them.

## Needs Kyle's call

- **"AI That Takes On Repetitive Work":** I capitalised "On" because "takes on" is a phrasal verb, as Title Case usually does. "Takes on" is the alternative.
- **The card thumbnail's look** (screenshots above), and the heading **"See It in Action"**.

## Your next step

Add each project's files to `public/images/work/<slug>/` (spec in the README). Then I'll open a follow-up PR with alt text and clip descriptions for your approval.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
