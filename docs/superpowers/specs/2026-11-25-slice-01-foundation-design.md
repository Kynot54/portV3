# Slice 01 — Foundation: Design

**Date:** 2026-11-25 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md` (Standing Brief). This doc adds the decisions made for Slice 1. Where they differ from `CLAUDE.md`, this doc wins for Slice 1, and the difference is listed under "Conflicts to flag".

## Intent

kwhynott.dev V3 has to read as "AI/SWE engineer, open to work" to employers and hiring managers. Slice 1 builds no content. It builds the **shell and the quality bar** that Slices 2–6 build on: the app, the visual system (palette, type, components), the nav, the theme, and a test and CI pipeline that fails when accessibility, performance or correctness slip. Get the foundation right once, so later slices only add pages.

## Goals

1. A Next.js app that builds, lints, type-checks and deploys as a Vercel preview. (Kyle connects Vercel; see Constraints.)
2. A visual system with one loud thing per screen. The accent is the only colour that pulls the eye, and everything else is black, white and grey.
3. The theme: dark by default, follows the system setting, has a manual toggle that persists, and never flashes the wrong theme on load.
4. A floating pill nav: logo (→ `/`), **Work, Blog, Contact**. Contact is the accent pill, last.
5. A layout shell: skip link, header, `main`, footer, and a 404 page.
6. Placeholder pages for `/`, `/work`, `/blog` and `/contact`, so every nav link works in the preview.
7. Tests and CI: Vitest and Testing Library (unit), Playwright (e2e, at mobile, tablet and desktop widths), axe (zero violations in both themes), and Lighthouse CI. All of them run on every PR.

## Non-goals (later slices)

- Home hero, the "Open to work" note, and About copy → Slice 2. Work content → Slice 3. Blog/MDX → Slice 4. **Recorded for Slice 4:** on mobile, the blog list is compact (title and date), and each entry can be expanded to show more. Contact form and booking → Slice 5. SEO, sitemap, the Services flag and the production deploy → Slice 6.
- Any admin, auth, database, cross-posting or consulting work (V3.1+). Don't block them: content stays in files under `content/`.

## Anti-goals (a failure even if it "works")

- **The accent is diluted.** More than the three approved uses, or other loud colours competing with it, kills the design's main idea.
- **A flash of the wrong theme** on load, or a theme that resets on navigation.
- **Placeholder copy that reads as real claims.** No invented metrics, clients or capabilities. Placeholders are obviously placeholders and are marked `TODO(kyle)`.
- **A quality gate that can be skipped.** If CI doesn't fail on an axe violation or a Lighthouse drop, the gate doesn't exist.

## Constraints

From `CLAUDE.md`, unchanged:

- **Accessibility:** WCAG AA, with ≥ 4.5:1 for body text. Full keyboard support with visible focus. `prefers-reduced-motion` honoured. No audio. Nothing flashes more than 3 times per second.
- **Privacy:** no phone number or personal email anywhere.
- **New dependencies are a joint decision.** The packages under "Approved dependencies" below are approved. Anything else is proposed under "Needs Kyle's call" and not installed.
- **Kyle's actions only:** creating the GitHub repo `Kynot54/portfolio-v3`, connecting Vercel, any domain or DNS change, merging, and any production deploy.
- **Git:** branch `slice/01-foundation`, one PR, no merge.
- **Definition of done:** tests green, axe zero, Lighthouse near-perfect with the report attached, no console errors, a manual keyboard pass, and mobile, tablet and desktop checked.

Environment facts found during recon:

- **Next.js 16.4.6, React 19.3, Tailwind 4.3.3.** The scaffold enables `cacheComponents` and uses the `@tailwindcss/turbopack` loader. `AGENTS.md` (written by Next) says to read `node_modules/next/dist/docs/` before writing code, because the APIs differ from older versions.
- **Kyle's existing setup:** `shadcn` as a dev package, the shadcn MCP server (`.mcp.json`) and agent skills (`.claude/`, `.agents/`, `skills-lock.json`) were set up before the scaffold. Keep them.
- **Two known install conflicts, both solved.** (1) The scaffold pins `@types/node@^20`, but Vitest 5 needs ≥ 22. Bump it to `^24`, matching Node 24. (2) `@vitejs/plugin-react` pulls an optional Babel 8 that clashes with shadcn's Babel 7. Don't install it; Vitest compiles TSX without it. Never use `--legacy-peer-deps` or `--force`.

## Approved dependencies (builder's call, Kyle may override)

"Approved" covers what the chosen tools need to work, and nothing beyond that:

- **Runtime:** `next`, `react`, `react-dom` (from the scaffold), `next-themes`, and whatever `shadcn init` (Base UI) adds itself: the Base UI package, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` and `lucide-react` (icons, including the toggle's).
- **Dev:** `tailwindcss` and `@tailwindcss/turbopack` (from the scaffold), `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`, `@axe-core/playwright` and `@lhci/cli`.
- **Not approved:** `@vitejs/plugin-react` (it conflicts) and `vite-tsconfig-paths` (use Vitest's own `resolve.alias`).

## Remote setup: Kyle does this later

Kyle creates the GitHub repo and connects Vercel later. His current V2 site is on Vercel, and V3 replaces it when V3 is ready; that switch is Slice 6 and Kyle's alone. So in Slice 1:

- All checks (lint, typecheck, unit, e2e, axe, Lighthouse) are proven **locally** against a production build. The CI workflow is written and validated, but it can't run until the repo exists.
- The slice ends on the local branch `slice/01-foundation`, with no push. It hands Kyle a short checklist:
  1. Create `Kynot54/portfolio-v3` and push the branch.
  2. Connect it to a **new** Vercel project; don't touch the V2 project or the domain.
  3. Make the CI job a **required status check** on `main` (branch protection).
  4. Open the PR.
- The PR body is written and saved locally (`docs/plans/slice-01-pr.md`), ready to paste, with "Preview URL: pending Kyle's Vercel setup".

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| A | shadcn (Base UI) plus a hand-written inline theme script, as in the Next 16 docs' "Preventing flash" guide | No extra dependency and no console warnings, but about 30 lines of theme code to own |
| **B ✔** | **shadcn (Base UI) plus `next-themes`** | **shadcn's documented dark-mode path, less of our own code. Costs: one dependency (last release 0.4.6, March 2025), and a dev-only React warning about rendering a `<script>`** |
| C | shadcn token names only, no components until Slice 5 | Smallest now, but buttons get hand-built and then rewritten |

**Kyle picked B.**

## Decisions (made by Kyle)

### Components: shadcn/ui on Base UI
- Run `shadcn init` with **Base UI** as the base library, no preset, and the neutral base colour. Then **replace** its colour values with the palette below.
- Add only the components Slice 1 uses. Expected: `button`, plus one for the mobile menu if it helps (for example `collapsible`). More arrive in later slices, when needed.

### Theme: `next-themes`
- `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`. The storage key is next-themes' default.
- **The toggle has three states: System (default), Light and Dark.** A single button in the pill cycles System → Light → Dark → System. Its accessible name says the current state and what a click does, for example "Theme: System. Switch to light". The icon shows the current state (Lucide `Monitor` / `Sun` / `Moon`). Choosing System clears the override, so the site follows the OS again.
- The dark class follows shadcn's convention (`.dark` on `<html>`, `@custom-variant dark (&:is(.dark *))`).

### Palette: "isolation"
The accent is the only loud colour. Everything else is black, white and grey.

| Token (shadcn name) | Dark (default) | Light | Contrast |
|---|---|---|---|
| `background` | `#000000` | `#FFFFFF` | — |
| `foreground` | `#F5F5F5` | `#0A0A0A` | 19.3 / 19.8 |
| `muted-foreground` | `#8A8A8A` | `#6B6B6B` | 6.1 / 5.3 |
| `primary` (**accent**) | `#39FF14` neon green | `#FF0080` hot magenta | — |
| `primary-foreground` | `#000000` | `#000000` | 15.5 / 5.6 on accent |
| `ring` (focus) | `#60A5FA` | `#1D4ED8` | 8.3 / 6.7 |
| new: `keyword` | `#60A5FA` | `#1D4ED8` | 8.3 / 6.7 |
| `border` / `input` | dark grey (builder picks, ~`#1F1F1F`) | light grey (~`#ECECEC`) | decorative |

The remaining shadcn tokens (`card`, `popover`, `secondary`, `accent`, `destructive` and so on) are the builder's call within these rules. They must stay in greys. Note that shadcn's own `accent` token is a hover background and is **not** our accent. `destructive` is a red, used only for errors.

**Accent rules:**
- **Three uses only:** the Contact nav pill, the page's main call to action, and the "Open to work" dot. (The dot itself ships in Slice 2. Slice 1 defines the style.)
- **Dark mode glow:** a soft, static ambient glow on accent elements, roughly `0 0 22px rgba(57,255,20,.55), 0 0 2px rgba(57,255,20,.9)`. Never animated.
- **Light mode:** a flat magenta fill with **no border and no glow**. Magenta against white is 3.8:1, which passes the 3:1 rule for UI components.
- **Text on the accent** is always black, in both themes.
- **The secondary button is quiet:** a grey outline with body-colour text. It is never blue and never the accent.

**Blue rules:**
- **Focus ring:** every interactive element, 2px, offset.
- **Links:** body-colour text with a **blue underline**.
- **Keywords:** **blue text, no underline, normal weight**, used for a few key terms per section, not every noun. Slice 1 ships the token and a `<Keyword>` component (a `<span>`), so MDX and pages can use it later.

### Responsive (whole site)
- **Nothing fixed-size.** No fixed pixel widths or heights for layout. Type and spacing scale fluidly with `clamp()` (for example, the hero h1 runs from about 30 px on mobile to about 44 px on desktop). Content sits in max-width containers with side padding that scales. Tall sections use dynamic viewport units (`dvh`/`svh`), so mobile browser bars don't cut them off.
- **Widths verified:** 320, 375, 768, 1024 and 1440 px, plus a short landscape phone (about 667×375) and 200% zoom. None of them may scroll horizontally.
- Later slices inherit these rules.

### Mobile nav (below 640 px, Tailwind `sm`)
```
Closed: [ Kyle Whynott   (█Contact█)  ☰ ]
Open:   [ Kyle Whynott   (█Contact█)  ✕ ]
        ┌───────────────────────────────┐
        │ Work                          │
        │ Blog                          │
        │ Theme: System  ◐              │
        └───────────────────────────────┘
```
- **Contact stays visible** next to the menu button. The accent never hides inside a menu.
- **What's in the menu:** a panel drops down under the pill, holding Work, Blog and the three-state theme toggle.
- **Pattern:** a disclosure, not a modal. The button is named "Menu" and carries `aria-expanded` and `aria-controls`. There's no focus trap.
- **Closing:** Esc closes the menu and returns focus to the button. Choosing a link, or a route change, closes it too.
- **Tap targets:** every item is ≥ 44 px tall.
- **Motion:** a short open animation, and none under `prefers-reduced-motion`.
- **Build:** a shadcn component (for example `collapsible`) or plain markup. No packages outside the approved list.

### Logo
- The logo is the text **KW** (Geist, bold) linking to `/`. Its accessible name is **"Kyle Whynott, home"** (`aria-label`), as Kyle decided.

### Type
- **Geist** (sans) for everything, and **Geist Mono** for the small uppercase micro-labels. Both load through `next/font/google`, which downloads them at build time and serves them from our own domain. There is no new dependency.

### Placeholder pages
- `/`, `/work`, `/blog` and `/contact` each have one `<h1>` and one obviously-placeholder line, marked `TODO(kyle): replaced in Slice NN`.

## Left to the builder

- File layout (`src/` dir, `src/components`, `src/lib`, `content/`), test file names, and the exact Playwright projects. The earlier draft plan in `docs/plans/slice-01.md` is a fine starting point, but it's out of date: it assumed a hand-written theme and no shadcn.
- Grey values for borders, cards and `secondary`, within the rules above.
- The theme toggle's markup. It must be a real `<button>`, with the three-state naming above and visible focus, and it must avoid hydration mismatches (for example, render the label and icon after mount, keeping a fixed-size placeholder so the layout doesn't shift).
- **No-JS behaviour:** the page renders dark, and the toggle is hidden (for example, with `<noscript><style>`). The system light preference is ignored when JS is off; this was accepted as a trade-off of B.
- **"No preference":** next-themes resolves a browser with no colour preference to light. Test the cases browsers actually report (`dark` → dark, `light` → light) and the stored override. Don't fight next-themes over `no-preference`.
- **Under `prefers-reduced-motion: reduce`:** no transitions or animations. The static glow is not motion and stays.
- The Lighthouse thresholds (≥ 0.95 per category is the bar), and the CI workflow's shape (GitHub Actions on PRs).

## Conflicts to flag in the PR

1. **`next-themes`, chosen over the docs' inline-script method.** In dev it logs a React "script tag" warning, but the production build, which e2e and Lighthouse run against, is clean. It treats "no preference" as light, not dark. Its last release was in March 2025.
2. **No-JS visitors always get dark,** even if their system is light (the brief says light follows the system).
3. **Blue is quieter than "blue in different shades" might suggest.** It's used for focus, link underlines and keywords, so the accent isn't diluted.
4. **Logo name vs visible text (WCAG 2.5.3 "Label in Name", Level A).** The visible text "KW" isn't part of the accessible name "Kyle Whynott, home". A voice-control user who says "click KW" may not hit it. Built as Kyle directed. A fix that keeps his wording would be the name "KW, Kyle Whynott, home".

## Needs Kyle's call (in the PR)

- The exact grey values, if he wants them tuned after seeing the preview.
- Meta description copy and footer social links (they need `content/source/resume.md`).
- **Decided by Kyle:** the grey values are tuned after he sees the preview (the builder ships sensible greys now).

## Review focus (failure modes worth testing)

1. **A stored theme against the opposite system setting:** the correct theme appears on first paint and after client-side navigation. Cycling back to System makes the site follow the OS again, live, when the OS setting changes.
2. **`localStorage` blocked** (Safari private mode): no crash and no console error, and the theme follows the system.
3. **320 px width, landscape phone and 200% zoom:** no horizontal scroll. At 640 px and above, the full pill shows. Below 640 px, the menu button shows, and the menu opens, closes on Esc, returns focus, and closes on navigation.
4. **axe in both themes,** covering contrast on muted text, links and the accent button.
5. **Keyboard:** the tab order is skip link → logo → Work → Blog → Toggle → Contact (or the builder's documented order), and every stop has a visible blue ring.
