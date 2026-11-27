## ⚠️ Merging deploys to production, with Services on

`SERVICES_ENABLED=true` and `NEXT_PUBLIC_CAL_CONSULT_LINK` are already set in Vercel Production, so merging makes `kwhynott.dev/services` live. It also adds a link line on Home and Contact and a footer link. To merge without going live, set `SERVICES_ENABLED` to `false` first.

## Summary

- **`/services`:** your consulting page for non-technical founders and small businesses, with the copy you approved (`src/lib/services-copy.ts`).
  - Three offers: websites, custom software, and AI for repetitive work.
  - Teaching your team: Teacher of Record for CPSC 483, and the C++ lectures and labs.
  - Three projects with links to their Work pages: C.O.N.T.R.O.L. BH, O'Hagan Electrical and the AI document pipelines.
  - Four steps, ending in handover and support.
- **Booking:** "Book a consultation" opens Cal.com on the page, on your consultation event. The hero button opens it too.
- **Contact form on the page:** messages from it arrive as **"Services: Name (Company)"**. Any other value is treated as a Contact message, and nothing from it reaches an email header.
- **Placement B:** not in the nav. Linked from Home's contact section, the Contact page and the footer, only while Services is on.
- **Search and sharing:** its own description (143 characters), a prebuilt 1200×630 card and a sitemap entry.
- **Safety net:** a production build with Services on fails if the consultation link is missing.
- **Facts:** every figure on the page is checked against `resume.md`. The check now matches longer phrases first, so a short one can't hide a wrong figure. I changed one figure on purpose to confirm it fails.
- **No new packages and no change to the security headers.**

Design: `docs/superpowers/specs/2026-11-26-slice-07-services-design.md`. Plan: `docs/plans/slice-07.md`.

## Screenshots

| Desktop, dark                                                                                                                | Desktop, light                                                                                                                | Mobile, dark                                                                                                                | Mobile, light                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/07-services/docs/plans/slice-07-screens/services-desktop-dark.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/07-services/docs/plans/slice-07-screens/services-desktop-light.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/07-services/docs/plans/slice-07-screens/services-mobile-dark.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/07-services/docs/plans/slice-07-screens/services-mobile-light.png?raw=true) |

## Test evidence

| Check                                               | Result                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                           | pass                                                                                                                                                                                                                                  |
| Unit (Vitest)                                       | **261 passed** (Services on and off, source handling, labels, build check, facts)                                                                                                                                                     |
| E2E (5 projects)                                    | **493 passed** with Services on: booking loads `test/consultation` while Contact still loads `test/30min`; the form sends `source: services`; the hero, links and project cards; axe in both themes; 200 with one h1                  |
| Lighthouse (12 URLs, 3 runs each)                   | **100 in every category**, `/services` included                                                                                                                                                                                       |
| Real Cal.com and Turnstile (local production build) | **No security-policy violations** in Chromium, Firefox or WebKit, on `/services` and `/contact`. Headless WebKit sometimes doesn't show the real calendar within 20 seconds; that also happens on `main`, so it isn't from this slice |

## Final review

A fresh reviewer read the whole branch. Verdict: ready with fixes. All five risk points in the plan hold.

- **Fixed:** the hero's "Book a consultation" only scrolled to the booking section. The design says it opens the calendar, so it now does. Without JavaScript it still jumps to the section.
- **My call, not changed:** the e2e and Lighthouse servers run with Services on, as production now does. The off state is covered by unit tests for the page, its tags, its card, the sitemap and all three links.
- **Left for later (minor):**
  1. A local build with Services on but no consultation link shows the hero button leading to a section with nothing to book (production can't build that way).
  2. The build error for a missing consultation link starts "Contact page:".
  3. The no-JavaScript hint "or book a call below" points the wrong way on desktop (Contact has the same line).
  4. The facts test ties the 40% donation figure to "by 40%", which also matches another résumé line.
  5. The pipelines card combines two résumé lines (50+ clients and 50% less manual review), as the Work page already does.
  6. Two of the three lists aren't labelled the way the steps list is (each sits in a labelled section).
  7. Lighthouse measures Home and Contact only with the Services link showing.

## Kyle's calls (2026-11-27)

1. **Step 4, reworded for a professional tone** (please confirm the final text): **"Handover and support.** I train your team on the finished product and transfer full ownership to your business, including the hosting and service accounts and their costs. After launch, I provide ongoing maintenance at a monthly rate until you hire someone to take it over."
2. **Form examples on Services (approved):** role **"Owner"**. The message example is now about what the founder wants built: **"Hi Kyle, I run a small business and I'd like a website where customers can request a quote online."**
3. **Buttons in the call-to-action colour (approved):** on Services, the hero's "Book a consultation", the booking button and "Send message" all use the accent colour. "Send a message" in the hero stays an outline button as the secondary action. The Contact page is unchanged: one accent button, and its booking button stays outline.

## Live checklist (after merging)

1. Open `kwhynott.dev/services` in Safari and in Chrome. Press **Book a consultation** at the top: your consultation event should open.
2. **Both calendars in one visit:** on `/contact`, press Book a call, then follow the footer's **Services** link and press Book a consultation. The consultation event should load, not the intro call. The test stand-ins can't check this.
3. Send a test message from `/services`. The email subject should start **"Services:"**.
4. With DevTools open, there should be no "Refused to…" errors.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
