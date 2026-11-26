## Summary

Slice 01 builds the foundation for kwhynott.dev V3: an empty but polished, responsive shell that later slices build on. It has no hero and no real page content yet.

- **Stack:** Next.js 16.4 (App Router, Cache Components), strict TypeScript, Tailwind 4, ESLint and Prettier. Node 24 is pinned.
- **Visual system:** shadcn/ui on Base UI with the "isolation" palette, where neon green (dark) or hot magenta (light) is the only loud colour. Fluid type and spacing, radii, a static accent glow, and a blue focus ring. Everything is documented in `docs/design-tokens.md`, and a test keeps the doc in sync with the CSS.
- **Theme:** next-themes with a three-state toggle (System → Light → Dark). System is the default, there's no flash of the wrong theme, and without JavaScript the site renders dark.
- **Layout:**
  - A floating pill nav (KW, Work, Blog, theme toggle, then Contact as the accent pill). Below 640 px it becomes KW, Contact and a Menu disclosure holding Work, Blog and the theme.
  - A skip link, a footer (GitHub and LinkedIn), and a 404 page.
  - It honours `prefers-reduced-motion`, with no horizontal scroll from 320 px up.
- **Content:**
  - `content/source/resume.md`, the web-safe transcription of the resume PDF. The ZIP code is removed, and Teaching Associate and Ulti-Health end May 2026, per Kyle.
  - `content/work/` and `content/blog/` with marked placeholder entries.
  - Typed loaders built on `gray-matter`, which reject bad frontmatter and path-traversal slugs.
- **`SERVICES_ENABLED`:** `/services` returns 404 unless the flag is exactly `true`. It's never in the nav and is `noindex`.
- **Placeholder pages:** `/`, `/work`, `/blog` and `/contact`, each using the real layout.
- **CI:** a `quality` job runs lint, format, typecheck, unit tests, e2e on Chromium, WebKit and Firefox (including axe), then Lighthouse. Dependabot runs monthly, grouped.
- **Repo:** MIT for the code. Writing and images are all rights reserved (`LICENSE`). There's a short README.

The design is in `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md` and the plan in `docs/plans/slice-01.md`.

## Preview URL

**https://portv3-git-slice-01-foundation-kynot54s-projects.vercel.app** (Vercel project `portv3`; previews are behind Vercel login, so sign in to view).

## Test evidence

All of these pass locally against a production build, and the `quality` CI job passes on this PR:

| Check                                                                                                         | Result                                                                |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `npm run lint` · `format:check` · `typecheck`                                                                 | pass                                                                  |
| `npm test` (Vitest)                                                                                           | **62 passed** (10 files)                                              |
| `npm run test:e2e` (Playwright: mobile 375, tablet 768, desktop 1440 on Chromium; WebKit and Firefox desktop) | **141 passed**, 69 skipped by design*; resize tests 130/130 on repeat |
| axe (WCAG 2.0/2.1/2.2 A+AA), every route, light and dark, mobile menu open                                    | 0 violations, no waivers                                              |
| Lighthouse (median of 3 runs, mobile emulation)                                                               | 100 / 100 / 100 / 100 on `/`, `/work`, `/blog` and `/contact`         |

\* The skips are tests that don't apply to a project: mobile-only and desktop-only cases, the viewport sweep (desktop Chromium only), and Tab-order checks in WebKit, where macOS skips links on Tab by default.

```
/          performance 100, accessibility 100, best-practices 100, seo 100
/work      performance 100, accessibility 100, best-practices 100, seo 100
/blog      performance 100, accessibility 100, best-practices 100, seo 100
/contact   performance 100, accessibility 100, best-practices 100, seo 100
All scores ≥ 0.99.
```

CI uploads the Lighthouse HTML reports and the Playwright report as the `reports` artifact. Locally they're in `.lighthouseci/` and `playwright-report/`.

**Keyboard pass:** done with Playwright driving real Chromium at 375 px and 1440 px, in light and dark.

- Tab order matches the spec on mobile and desktop.
- Enter cycles the toggle, and System follows the OS again.
- The menu opens with Enter, Tab moves into it, and Esc closes it and returns focus to Menu.
- There were no console errors.

The pass found two issues, both fixed with tests:

- The focus ring faded in from grey.
- The mobile-menu theme row had no visible label.

A hands-on pass on a real phone is still worth a minute before merging.

**Independent review** (a fresh reviewer read the whole branch): no critical findings, four important ones, and nine minor ones. Fixed in this PR, each with a test that failed first:

- Without JS on mobile, the menu panel covered the page heading. Now the desktop links show at every width.
- Keyboard focus was lost when the viewport crossed 640 px. It now moves to the matching visible nav item.
- The fixed pill could hide the focused element (WCAG 2.4.11). Fixed with `scroll-padding-top`.
- The mobile menu now also closes on a tap outside, when focus leaves it, and on a logo tap.
- A misnamed content file (such as `My-Post.mdx`) now fails the build instead of silently disappearing.
- The pill is now 95% opaque, so the grey nav text stays at least 4.5:1 over anything scrolled beneath it.

**Deferred minor findings, your call:**

- If `localStorage` is blocked and the OS is light, the page flashes dark before switching (a next-themes limit).
- Without JS there's no `color-scheme`, so light scrollbars show on the dark page.
- Calendar-invalid dates such as 2026-02-30 pass the loader.
- WebKit Tab-order tests are skipped; `Alt+Tab` would cover them.
- The unused Button `link` variant is 3.7:1 in light mode. Remove or restyle it before using it.
- CI runs twice per PR push.
- The menu's Escape listener is page-wide; scope it before adding dialogs.

## TODO(kyle) placeholders

- `src/app/layout.tsx`: final meta description copy
- `src/app/icon.svg`: the placeholder KW favicon
- `src/app/page.tsx` (Slice 02), `work/page.tsx` (03), `blog/page.tsx` (04), `contact/page.tsx` (05): placeholder pages
- `content/work/placeholder-project.mdx` (Slice 03), `content/blog/placeholder-post.mdx` (Slice 04)
- `src/app/services/page.tsx` and `docs/plans/services.md`: the Services copy

## Needs Kyle's call

- **Greys** (card, secondary, muted, border, input): first-pass values in `docs/design-tokens.md`, to tune after the preview.
- **Meta description:** currently "Kyle Whynott, AI and software engineer."
- **Favicon:** a bold "KW", green on black, or magenta on white in light mode.
- **README copy.**
- **Packages added** beyond the brief's named stack, all approved during design:
  - `next-themes` and `gray-matter`.
  - `prettier`.
  - What `shadcn init` installs: `@base-ui/react`, `class-variance-authority`, `lucide-react`, `tw-animate-css`, and **`cn`**. `cn` is shadcn's own package, from `github.com/shadcn-ui/cn`, and it replaces `clsx` + `tailwind-merge`.

## Conflicts flagged

1. **next-themes instead of the Next 16 docs' inline-script method.** It logs a React "script tag" warning in dev only, and production is clean. It treats "no colour preference" as light. Its last release was March 2025.
2. **No-JS visitors always get dark,** even if their OS is light.
3. **Blue is quieter than "blue in different shades" might suggest.** It's used only for the focus ring, link underlines and `<Keyword>`, so the accent isn't diluted.
4. **Logo name: resolved.** Kyle switched it to "KW, Kyle Whynott, home". The visible "KW" is now inside the name (WCAG 2.5.3), and the axe waiver is gone.

5. **The live V2 Vercel project now builds this repo. Resolved by Kyle.** The `portfolio` project (which serves `kwhynott.dev`) builds `Kynot54/portV3` with Next.js, but Kyle set it to build **previews only**, so merging doesn't deploy production and V2 stays live. After merging, a quick check that `kwhynott.dev` still shows V2 confirms it.

## Kyle's checklist

1. ~~Give `gh` the `workflow` permission~~ Done.
2. ~~Connect a new Vercel project~~ Done (`portv3`). The `portfolio` project builds previews only, per conflict #5.
3. ~~Make `quality` a required status check on `main`~~ Done. `main` requires `quality` and blocks force-pushes and deletion; admins can still override.
4. **Review and merge.** Slice 02 branches from the updated `main`.
