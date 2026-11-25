# Slice 01: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A responsive Next.js shell for kwhynott.dev V3: the shadcn (Base UI) visual system with the "isolation" palette, a three-state theme through next-themes, a pill nav with a mobile menu, placeholder routes, and a local quality pipeline (unit, e2e, axe, Lighthouse) plus a CI workflow ready for when the repo exists.

**Architecture:** Next.js App Router in `src/`. The colours are shadcn CSS variables in `globals.css`. `next-themes` toggles `.dark` on `<html>`, and the server renders `class="dark"` so no-JS visitors get dark. The nav is one client component: the full pill from 640 px up, and logo + Contact + a disclosure menu below 640 px. Content stays in files under `content/`.

**Tech Stack:** Next.js 16.4.6, React 19.3, TypeScript strict, Tailwind 4.3.3 (`@tailwindcss/turbopack`), shadcn/ui on Base UI, next-themes, lucide-react, Vitest 5 + jsdom + Testing Library, Playwright + @axe-core/playwright, @lhci/cli, GitHub Actions. npm, Node 24.

**Spec:** `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md` (approved). The spec of record is `CLAUDE.md`.

## Approach, alternatives, risks

The `CLAUDE.md` working agreement asks for these three.

- **Approach:** finish setup → design tokens → theme → nav and shell → e2e/a11y → Lighthouse and CI → handoff. Each task lands with its tests.
- **Alternatives considered:** the full list is in the spec under "Approaches". Kyle chose shadcn + next-themes over a hand-written inline theme script. For the mobile menu, I picked plain disclosure markup over a shadcn component: it's 3 items, and a modal or sheet would add a focus trap, which a nav menu shouldn't have.
- **Risks:**
  - next-themes logs a React "script tag" warning in dev. The e2e console check runs against the production build, so it isn't affected.
  - `cacheComponents` rejects `new Date()` in prerendered server components, so the footer has no year.
  - Lighthouse scores vary between runs, so they're medians of 3.
  - Fonts download at build time (see the environment notes).

## Global Constraints

- **Palette.**
  - Dark: background `#000000`, foreground `#F5F5F5`, muted-foreground `#8A8A8A`, primary `#39FF14`, primary-foreground `#000000`, ring/keyword `#60A5FA`.
  - Light: background `#FFFFFF`, foreground `#0A0A0A`, muted-foreground `#6B6B6B`, primary `#FF0080`, primary-foreground `#000000`, ring/keyword `#1D4ED8`.
- **Accent: three uses only.** Contact nav pill, the main call to action, the "Open to work" dot (the dot ships in Slice 2).
  - Dark glow: `0 0 22px rgba(57,255,20,.55), 0 0 2px rgba(57,255,20,.9)`, static.
  - Light: flat fill, no border, no glow.
  - Text on the accent is always black.
- **Blue roles.** Focus ring (2px, offset); links are body colour with a blue underline; keywords are blue text with no underline and normal weight. The secondary button is a grey outline: never blue, never the accent. All other shadcn tokens are greys; `destructive` is red, for errors only.
- **Type.** Geist and Geist Mono through `next/font/google`.
- **Theme.** next-themes with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
  - The toggle cycles System → Light → Dark → System.
  - The accessible name is `Theme: <Current>. Switch to <next>`, for example "Theme: System. Switch to light".
  - Icons: Lucide `Monitor`, `Sun`, `Moon`.
- **Responsive.**
  - No fixed pixel widths or heights for layout. Type and spacing use `clamp()`; the hero h1 runs from about 30 px to about 44 px. Tall sections use `dvh`/`svh`.
  - No horizontal scroll at 320, 375, 768, 1024 or 1440 px, a 667×375 landscape phone, or 200% zoom.
- **Mobile nav (< 640 px).**
  - Pill: logo, Contact pill, then a "Menu" button with `aria-expanded` and `aria-controls`.
  - The panel holds Work, Blog and the toggle.
  - It's a disclosure: no focus trap. Esc closes it and returns focus to the button. A link click or route change closes it.
  - Tap targets are ≥ 44 px. No animation under `prefers-reduced-motion`.
- **Accessibility.** WCAG AA (body text ≥ 4.5:1), full keyboard support, a visible focus ring everywhere, `prefers-reduced-motion` honoured, no audio, nothing flashing more than 3 times per second.
- **Packages.**
  - Only those in the spec's "Approved dependencies" list.
  - Never `@vitejs/plugin-react` or `vite-tsconfig-paths`.
  - Never `--legacy-peer-deps` or `--force`.
- **Copy.** No phone number or email. Placeholders are marked `TODO(kyle)`. No invented claims.
- **Git.** Branch `slice/01-foundation`, local only: no push, no remote, no merge, no deploy.
- **Environment notes (this machine).**
  - Run npm with `npm_config_cache=$TMPDIR/npm-cache`, because `~/.npm` is sandbox-blocked.
  - `next build` needs network access to `fonts.googleapis.com` and `fonts.gstatic.com`.
  - git writes to `.git` need the sandbox off.
  - Read `node_modules/next/dist/docs/` before using a Next API you haven't checked, per `AGENTS.md`.

## Review Focus

1. **Stored theme against the opposite OS setting.** Correct on first paint, after client navigation, and after a reload. → Task 5 `stored light beats OS dark on first paint and after navigation`.
2. **System choice follows live OS changes.** After cycling back to System, flipping the OS scheme changes the page without a reload. → Task 5 `system follows OS change live`.
3. **Resize across 640 px with the menu open.** No stuck open panel, and focus isn't lost. → Task 4 `menu closes when viewport crosses to desktop`; Task 5 `resize from mobile to desktop with menu open`.
4. **`localStorage` throws** (Safari private mode). The page loads in the system theme, the toggle still works for the visit, and there are no console errors. → Task 5 `toggle works when localStorage throws`.
5. **No JavaScript.** Renders dark and hides the toggle; the nav links still work. On mobile, the Menu button is hidden and the panel's links are reachable. → Task 5 `no-JS renders dark, hides toggle, links reachable`.

---

## File structure

```
src/app/layout.tsx            html (class="dark", suppressHydrationWarning), fonts, ThemeProvider, skip link, Header, main, Footer, noscript style
src/app/globals.css           tailwind + tw-animate-css, shadcn tokens with our palette, dark variant, fluid type, glow, focus, reduced-motion
src/app/page.tsx, work/page.tsx, blog/page.tsx, contact/page.tsx, not-found.tsx
src/components/ui/button.tsx  shadcn (generated), plus our `accent` styling via variant
src/components/theme-provider.tsx
src/components/theme-toggle.tsx
src/components/header.tsx     desktop pill + mobile disclosure
src/components/footer.tsx
src/components/keyword.tsx
src/lib/theme.ts              ThemeChoice, nextTheme, themeLabel
src/lib/site.ts               siteConfig
src/lib/utils.ts              cn (generated by shadcn)
tests/unit/*.test.ts(x)       Vitest
tests/support/contrast.ts     test-only WCAG contrast helper
tests/e2e/*.spec.ts           Playwright
playwright.config.ts, lighthouserc.json, .github/workflows/ci.yml
docs/plans/slice-01-pr.md     PR body, ready to paste
```

---

### Task 1: Baseline: dependencies, scripts, first green build

The current state: the scaffold, `vitest.config.mts`, `vitest.setup.ts` and `content/source/README.md` are on disk and uncommitted. The test packages aren't installed.

**Files:**
- Modify: `package.json`, `vitest.setup.ts`, `.gitignore` (confirm it ignores `/.superpowers/`, `/.claude/settings.local.json`, `/.claude/.cc-writes`, `/.lighthouseci/`, `/playwright-report/`, `/test-results/`)

**Interfaces:**
- Produces: the npm scripts `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e` (`playwright test`) and `lhci` (`lhci autorun`). Vitest uses jsdom with the `@` → `src` alias, and the setup file provides a `window.matchMedia` stub that later tasks can control.

- [ ] **Step 1:** Set `@types/node` to `^24`. Then run `npm i -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event`. Expected: exit 0 with no ERESOLVE.
- [ ] **Step 2:** In `vitest.setup.ts`, add a `matchMedia` stub that tests can drive. Export it from `tests/support/match-media.ts` as `setPrefersDark(dark: boolean): void`. It must notify `change` listeners on `(prefers-color-scheme: dark)`. Keep the existing cleanup.
- [ ] **Step 3:** Confirm the scripts are set (`typecheck`, `test`, `test:e2e` and `lhci` are already added).
- [ ] **Step 4: Verify.** Run `npx next typegen && npm run lint && npm run typecheck && npm test && npm run build`. Allow network access to the font hosts. Expected: all exit 0. Vitest reports no test files and passes.
- [ ] **Step 5: Commit.** Stage only the scaffold and project files: `src/ public/ content/ package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs vitest.* tests/ .gitignore AGENTS.md`. Leave Kyle's tooling files untracked (`.agents/`, `.claude/`, `.mcp.json`, `skills-lock.json`). Message: `chore: scaffold Next.js 16 app with unit-test tooling`.

---

### Task 2: Visual system: shadcn on Base UI, palette, Keyword

**Files:**
- Create (by CLI): `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- Create: `src/components/keyword.tsx`, `tests/support/contrast.ts`, `tests/unit/palette.test.ts`, `tests/unit/keyword.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces:
  - CSS variables `--background`, `--foreground`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--ring`, `--keyword`, `--border` and the remaining shadcn tokens, under `:root` (light) and `.dark` (dark).
  - Tailwind colours from them (`bg-primary`, `text-keyword`, and so on).
  - Utility `.accent-glow`: the dark glow, `none` in light.
  - Fluid type utilities `text-hero` (`clamp(1.875rem, 1.2rem + 3vw, 2.75rem)`) and `text-body-fluid`.
  - `Button` variants: shadcn defaults; `default` = the accent (bg-primary, black text, glow in dark); `outline` = the quiet grey.
  - `Keyword({ children }: { children: React.ReactNode }): JSX.Element`, which renders `<span className="text-keyword">`.
  - Test helper `contrastRatio(hexA: string, hexB: string): number` (WCAG 2.x relative luminance).

- [ ] **Step 1:** Run `npx shadcn@latest init --base base --no-monorepo -y`, then `npx shadcn@latest add button`. Expected: `components.json` has `base`, and the packages it adds stay within the approved list. If it asks for a preset, pick its neutral default.
- [ ] **Step 2: Write the failing tests.**

`tests/unit/palette.test.ts`: parse `src/app/globals.css`, read each token's hex for `:root` and `.dark`, and assert:

```ts
test.each([
  ['dark', 'foreground', 'background', 19],
  ['dark', 'muted-foreground', 'background', 6],
  ['dark', 'keyword', 'background', 8],
  ['dark', 'primary-foreground', 'primary', 15],
  ['light', 'foreground', 'background', 19],
  ['light', 'muted-foreground', 'background', 5.3],
  ['light', 'keyword', 'background', 6.7],
  ['light', 'primary-foreground', 'primary', 5.5],
  ['light', 'primary', 'background', 3.7],
])('%s %s on %s ≥ %s:1', (theme, fg, bg, min) => {
  expect(contrastRatio(token(theme, fg), token(theme, bg))).toBeGreaterThanOrEqual(min);
});
test('palette values match the spec exactly', () => {
  expect(token('dark', 'primary')).toBe('#39FF14');
  expect(token('light', 'primary')).toBe('#FF0080');
  expect(token('dark', 'background')).toBe('#000000');
  expect(token('light', 'background')).toBe('#FFFFFF');
});
```

`tests/unit/keyword.test.tsx`: `<Keyword>LLMs</Keyword>` renders a `span` with text `LLMs` and class `text-keyword`, and it is not a link.

- [ ] **Step 3:** Run `npm test`. Expected: FAIL. The tokens are still shadcn defaults (oklch, not our hexes), and `keyword` is missing.
- [ ] **Step 4: Implement.**
  - **Tokens:** replace the token values in `globals.css` with the Global Constraints palette, as hex. Light goes under `:root`, dark under `.dark`. Grey values for card, popover, secondary, accent (shadcn's hover token), border and input follow the spec's rules.
  - **Keyword:** add `--keyword` and `--color-keyword` in `@theme inline`.
  - **Rules:** add `.accent-glow`, the fluid type utilities, a global `:focus-visible` ring (2px `var(--ring)`, offset 2px), and the reduced-motion rule (no animations or transitions).
  - **Components:** set the Button `default` variant to the accent with `accent-glow`, and write `Keyword`.
- [ ] **Step 5:** Run `npm test`. Expected: PASS (11 tests). Then run `npm run build`. Expected: exit 0.
- [ ] **Step 6: Commit.** `feat: shadcn (Base UI) with isolation palette and Keyword`

---

### Task 3: Theme: next-themes and the three-state toggle

**Files:**
- Create: `src/lib/theme.ts`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `tests/unit/theme.test.ts`, `tests/unit/theme-toggle.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `type ThemeChoice = 'system' | 'light' | 'dark'`
  - `nextTheme(current: ThemeChoice): ThemeChoice`, cycling system → light → dark → system
  - `themeLabel(current: ThemeChoice): string`, returning `Theme: System. Switch to light` and so on
  - `ThemeProvider({ children })`: a client wrapper around next-themes with the Global Constraints props
  - `ThemeToggle(): JSX.Element`: a `<button type="button" className="theme-toggle …">`

- [ ] **Step 1: Write the failing tests.**

```ts
// tests/unit/theme.test.ts
test('cycles system → light → dark → system', () => {
  expect(nextTheme('system')).toBe('light');
  expect(nextTheme('light')).toBe('dark');
  expect(nextTheme('dark')).toBe('system');
});
test('label names current and next', () => {
  expect(themeLabel('system')).toBe('Theme: System. Switch to light');
  expect(themeLabel('light')).toBe('Theme: Light. Switch to dark');
  expect(themeLabel('dark')).toBe('Theme: Dark. Switch to system');
});
```

```tsx
// tests/unit/theme-toggle.test.tsx: render <ThemeProvider><ThemeToggle/></ThemeProvider>
test('starts on System and resolves from the OS', async () => {
  setPrefersDark(true);
  renderToggle();
  expect(await screen.findByRole('button', { name: 'Theme: System. Switch to light' })).toBeInTheDocument();
  expect(document.documentElement).toHaveClass('dark');
});
test('clicking cycles and applies the class', async () => {
  setPrefersDark(true); renderToggle();
  await userEvent.click(await screen.findByRole('button'));
  expect(document.documentElement).toHaveClass('light');
  expect(screen.getByRole('button')).toHaveAccessibleName('Theme: Light. Switch to dark');
});
test('choosing System again follows the OS', async () => {
  setPrefersDark(false); renderToggle();
  const btn = await screen.findByRole('button');
  await userEvent.click(btn); await userEvent.click(btn); await userEvent.click(btn); // back to system
  expect(document.documentElement).toHaveClass('light');
  act(() => setPrefersDark(true));
  expect(document.documentElement).toHaveClass('dark');
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, because `@/lib/theme` is not found.
- [ ] **Step 3:** Run `npm i next-themes`. Write `theme.ts`, `ThemeProvider` and `ThemeToggle`.
  - The toggle reads `theme` from `useTheme()` and calls `setTheme(nextTheme(...))`.
  - **Before mount:** to avoid a hydration mismatch, render a fixed-size button with `aria-label="Theme"`. After mount, render the real label and icon.
  - Icons are `aria-hidden`.
- [ ] **Step 4: `layout.tsx`.**
  - `<html lang="en" className={cn('dark', fonts…)} suppressHydrationWarning>`
  - Wrap the body in `ThemeProvider`.
  - Add `<noscript><style>{'.theme-toggle{display:none}'}</style></noscript>` in the head.
  - Metadata: `title: { default: 'Kyle Whynott', template: '%s · Kyle Whynott' }`, `description: 'Kyle Whynott, AI and software engineer.'` with `// TODO(kyle): final copy`, and `metadataBase` from `siteConfig.url` (Task 4). Until then, inline `https://kwhynott.dev`.
- [ ] **Step 5:** Run `npm test`. Expected: PASS (5 new tests). Then run `npm run build`. Expected: exit 0.
- [ ] **Step 6: Commit.** `feat: three-state theme with next-themes`

---

### Task 4: Shell: responsive pill nav, mobile menu, footer, routes

**Files:**
- Create: `src/lib/site.ts`, `src/components/header.tsx`, `src/components/footer.tsx`, `src/app/{work,blog,contact}/page.tsx`, `src/app/not-found.tsx`, `tests/unit/header.test.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` (Task 3), `Button` (Task 2).
- Produces:
  - `type NavItem = { href: '/work' | '/blog' | '/contact'; label: string }`
  - `siteConfig: { name: 'Kyle Whynott'; url: string /* NEXT_PUBLIC_SITE_URL ?? 'https://kwhynott.dev' */; nav: NavItem[]; contact: NavItem }`. `nav` is Work and Blog; `contact` is separate, because it renders as the accent pill.
  - `Header(): JSX.Element` (client), with menu panel id `mobile-menu`.
  - `Footer(): JSX.Element`, rendering `© Kyle Whynott` and nothing else (no year, because of `cacheComponents`; social links are `TODO(kyle)`).

- [ ] **Step 1: Write the failing tests** in `tests/unit/header.test.tsx`. Mock `next/navigation` `usePathname`.

```tsx
test('logo shows KW and is named "Kyle Whynott, home", linking to /', ...)
test('desktop nav: logo, Work, Blog, theme toggle, Contact in DOM order', ...)   // within nav "Main"; Contact is last
test('marks current section, including nested paths', ...)                       // '/blog/x' → Blog aria-current="page"
test('Contact uses the accent button style', ...)                                 // has class from Button default variant (bg-primary)
test('menu button toggles aria-expanded and controls #mobile-menu', ...)
test('Escape closes the menu and returns focus to the button', ...)
test('clicking a menu link closes the menu', ...)
test('route change closes the menu', ...)                                          // rerender with new pathname
test('menu closes when viewport crosses to desktop', ...)                          // matchMedia('(min-width: 640px)') change → closed
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, because `Header` is not found.
- [ ] **Step 3: Implement `site.ts`, `Header` and `Footer`.**
  - **Nav markup:** `<header>` → `<nav aria-label="Main">`. It's a floating pill: fixed or sticky, centred, `rounded-full`, with a border, a `max-w` cap and fluid side margins.
  - **Logo:** the visible text `KW` (bold), with `aria-label="Kyle Whynott, home"`, linking to `/`.
  - **From `sm` up:** logo link, Work, Blog, `ThemeToggle`, Contact (`Button` default variant, `rounded-full`).
  - **Below `sm`:** logo, Contact, Menu button (`aria-expanded`, `aria-controls="mobile-menu"`, Lucide `Menu`/`X` icons).
  - **Panel:** `#mobile-menu` holds Work, Blog and `ThemeToggle`.
  - **Behaviour:** links get `aria-current="page"` when `pathname === href || pathname.startsWith(href + '/')`. Every target is at least 44 px.
  - **Panel animation:** a tw-animate fade or slide that the reduced-motion rule turns off.
  - **No JS:** the `noscript` style also hides the Menu button and shows the panel's links inline.
- [ ] **Step 4: Layout and pages.**
  - **Skip link:** `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` as the body's first child.
  - **Body:** `Header`, then `<main id="main" tabIndex={-1}>` with top padding that clears the floating pill, then `Footer`.
  - **Pages:** each route renders `<h1 className="text-hero">` (Kyle Whynott / Work / Blog / Contact) and one line, `Placeholder. This page arrives in Slice NN.` with `{/* TODO(kyle) */}`. Each sets `metadata.title`, except Home.
  - **404:** `not-found.tsx` renders `<h1>Page not found</h1>` and a link home.
- [ ] **Step 5:** Run `npm test`. Expected: PASS (9 new tests). Then run `npm run build`. Expected: exit 0, listing the routes `/`, `/work`, `/blog`, `/contact` and `/_not-found`.
- [ ] **Step 6: Commit.** `feat: responsive pill nav with mobile menu, shell and placeholder routes`

---

### Task 5: End-to-end, accessibility and responsive suite

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: the routes (Task 4), the `.dark`/`.light` classes, `.theme-toggle`, `#mobile-menu`, the button names "Menu" and `Theme: …` (Tasks 3–4).

- [ ] **Step 1: Install and configure.**
  - Run `npm i -D @playwright/test @axe-core/playwright && npx playwright install chromium webkit`.
  - `webServer: { command: 'npm run build && npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 180_000 }`.
  - Projects: `mobile` (375×667), `tablet` (768×1024), `desktop` (1440×900) on Chromium, plus `webkit-desktop`.
  - `fixtures.ts` extends `test` to collect `console` errors and `pageerror` events, and fails the test if any were seen.
- [ ] **Step 2: `shell.spec.ts`.**
  - Each of the 4 routes returns 200 and has exactly one h1.
  - `/nope` returns 404 with the h1 "Page not found".
  - Desktop tab order: skip link → logo → Work → Blog → theme toggle → Contact. Each stop has a non-`none` `outline-style`.
  - Mobile tab order: skip link → logo → Contact → Menu.
  - The skip link moves focus to `#main`.
- [ ] **Step 3: `theme.spec.ts`.**
  - `OS dark → dark`.
  - `OS light → light`.
  - `stored light beats OS dark on first paint and after navigation`: `addInitScript` sets next-themes' key to `light` and emulates the dark scheme. Assert the `<html>` class at `domcontentloaded`, after a client navigation to `/work`, and after a reload.
  - `cycling the toggle persists across reload and updates its name`.
  - `system follows OS change live`: cycle back to System, then `emulateMedia({ colorScheme })` flips the class without a reload.
  - `toggle works when localStorage throws`: `addInitScript` makes `Storage.prototype.getItem` and `setItem` throw. The page loads following the OS, the toggle still flips it, and the fixture sees no console errors.
  - `no-JS renders dark, hides toggle, links reachable`: a new context with `javaScriptEnabled: false` and the light scheme. `<html>` has `dark`, `.theme-toggle` is hidden, and Work and Blog links are visible at 375 px and at 1440 px.
  - `reduced motion: no transitions on nav links or menu`.
- [ ] **Step 4: `a11y.spec.ts`.** For each route, in each theme (stored `light`, stored `dark`), and on mobile with the menu open, `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()` returns `violations` equal to `[]`.
- [ ] **Step 5: `responsive.spec.ts`.**
  - For widths 320, 375, 768, 1024 and 1440, and for 667×375, on every route, `scrollWidth <= clientWidth`.
  - At 200% zoom (CSS `zoom` on `html`, at 1280 px) there is no horizontal scroll and the pill isn't clipped.
  - At 639 px the Menu button shows; at 640 px the full pill shows.
  - `resize from mobile to desktop with menu open`: the panel isn't visible and focus is on the body or a visible element.
  - The hero h1's computed font size is under 32 px at 375 and over 40 px at 1440.
- [ ] **Step 6:** Run `npm run test:e2e`. Expected: all pass on all 4 projects. If axe or the responsive checks fail, fix the code, not the assertions.
- [ ] **Step 7: Commit.** `test: e2e, theme, axe and responsive coverage`

---

### Task 6: Lighthouse and the CI workflow

**Files:**
- Create: `lighthouserc.json`, `.github/workflows/ci.yml`

- [ ] **Step 1: Lighthouse config.**
  - Run `npm i -D @lhci/cli`.
  - `lighthouserc.json`: `collect.startServerCommand: "npm run start"`, `url` set to the 4 routes on `http://localhost:3000`, `numberOfRuns: 3`.
  - Assertions: `categories:performance`, `categories:accessibility`, `categories:best-practices` and `categories:seo`, each `["error", {"minScore": 0.95}]`.
  - `upload.target: "filesystem"`, `outputDir: ".lighthouseci"`.
- [ ] **Step 2:** Run `npm run build && npm run lhci`. Expected: all assertions pass. Note the median scores per route for the PR.
- [ ] **Step 3: Write `ci.yml`.**
  - It runs on `pull_request` and on `push` to `slice/**`, on `ubuntu-latest`, with `actions/setup-node` (Node 24, npm cache).
  - Steps: `npm ci` → lint → typecheck → `npm test` → `npx playwright install --with-deps chromium webkit` → `npm run test:e2e` → `npm run lhci`. Upload `playwright-report/` and `.lighthouseci/` as artifacts, always.
  - One job, named `quality`, so Kyle can mark it as the required check.
- [ ] **Step 4: Validate.** Run `npx --yes @action-validator/cli .github/workflows/ci.yml`. Expected: no errors. If that package isn't available, check that the YAML parses with `node -e "require('yaml')…"` (no new dependency), and note in the PR that the first real run happens once the repo exists.
- [ ] **Step 5: Commit.** `ci: quality job (lint, types, unit, e2e, axe, Lighthouse)`

---

### Task 7: Handoff

- [ ] **Step 1:** Run the full local suite: `npm run lint && npm run typecheck && npm test && npm run test:e2e && npm run lhci`. Expected: all green. Save the tail of each output for the PR.
- [ ] **Step 2: Manual keyboard pass.** At 375 px and 1440 px, in each theme state: tab through, open and close the menu with Enter and Esc, and cycle the toggle. Record the result.
- [ ] **Step 3: Write `docs/plans/slice-01-pr.md`.** It holds:
  - **Summary.**
  - **Test evidence:** command tails, and the Lighthouse medians with the `.lighthouseci/` report paths.
  - **Preview URL:** pending Kyle's Vercel setup.
  - **Needs Kyle's call:** grey values (tuned after the preview), meta description, footer links.
  - **TODO(kyle):** `resume.md`, page copy, social links.
  - **Conflicts flagged:** the 4 from the spec (including the logo's label-in-name).
  - **Kyle's checklist:** create `Kynot54/portfolio-v3` and push the branch; connect a **new** Vercel project without touching V2 or the domain; make `quality` a required check on `main`; open the PR.
- [ ] **Step 4: Commit.** `docs: Slice 01 PR description and handoff checklist`

## Self-review notes

- **Spec coverage:**
  - Each spec item maps to a task: palette and accent rules (2), keyword (2), type (1–2), theme and three states (3), no-JS (3, 5), responsive (2, 4, 5), mobile nav (4, 5), placeholders (4), approved packages (all), remote setup later (6–7), conflicts (7).
  - The Slice 4 blog note is out of scope here by design.
- **Names:** `ThemeChoice`, `nextTheme`, `themeLabel`, `siteConfig.nav` / `siteConfig.contact`, `#mobile-menu`, `.theme-toggle` and `text-keyword` are used the same way in every task.
- **Execution method:** Kyle chose Native for the earlier draft. Confirm it still applies.
