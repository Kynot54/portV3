# Slice 02: Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Home placeholder with the approved page. In order:

- a hero with copy, calls to action, a proof line, and the animated "three eras" band (SVG + CSS)
- Selected work: three real work entries
- About
- Contact

**Architecture:**

- **All server components; no client JavaScript added.** Home is a server component built from small section components in `src/components/home/`.
- **Selected work** comes from `content/work/*.mdx`, through an extended loader (`featured`, `order`, `label`).
- **The visual** is inline SVG, animated only with CSS (`transform`, `opacity`, `offset-distance`), and frozen under `prefers-reduced-motion`.

**Tech Stack:** The Slice 1 stack, unchanged: Next.js 16.4, React 19, Tailwind 4, shadcn `Button`, Vitest, Playwright + axe, LHCI. **No new packages.**

**Spec:** `docs/superpowers/specs/2026-11-26-slice-02-home-design.md` (approved 2026-11-26). The system rules are in `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md` and `docs/design-tokens.md`.

## Approach, alternatives, risks

The `CLAUDE.md` working agreement asks for these three.

- **Approach:** content and loader → hero copy → visual → remaining sections → full e2e, a11y and performance pass → PR.
- **Alternatives:** the hero visual's options (canvas, static SVG, WebGL, SVG + CSS) are compared in the spec. Kyle picked SVG + CSS.
- **Risks:**
  - **Seamless loops:** CSS `offset-path` and seamless loops need careful geometry.
  - **Grain cost:** the grain pattern must stay cheap to paint at large widths.
  - **Merging is a production deploy.** `kwhynott.dev` serves V3, so the PR body must say so.

## Global Constraints

- **Copy (verbatim; any change is Kyle's call):**
  - Micro-label: `Open to work · AI / Software Engineer`
  - h1: `I'm Kyle Whynott, an AI engineer.`
  - Lead: `I understand AI systems end to end. I fit them into how a business actually works. I design the system first, then build the automations and software around it.`
  - Calls to action: `Get in touch →` (accent `Button`, href `/contact`) and `See my work` (`outline` `Button`, href `#work`)
  - Proof line: `Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering`
  - Section `<h2>`s: `Selected work`, `About`, `Contact`
  - About: `I grew up with analog, came of age with digital, and adapted and evolved with AI. I've lived with all three, so I can explain each one plainly and connect them. I designed and taught a machine learning course to 40+ students at Cal State Fullerton, and I've taught C++ from object-oriented design up to data structures.`
  - Contact: `I'm looking for my next role as an AI or software engineer. Let's talk.` plus `Get in touch →` (accent, `/contact`)
- **Work cards** (order, label, title, summary):
  1. `AI · 2025–26` · `AI document pipelines` · `I built AI pipelines for 10+ clients. Manual review dropped 50%.`
  2. `Web · 2024–25` · `C.O.N.T.R.O.L. BH` · `I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%.`
  3. `AI · Mobile · 2025–26` · `Ulti-Health` · `I built a wellness app that plans workouts and meals from the user's own data.`
- **Facts:** every number on Home appears in `content/source/resume.md`.
- **Accent:** only on the nav Contact pill, the `Get in touch` buttons, the open-to-work dot, and the visual's travelling points. Never the word "Zillennial" or any generational label.
- **Visual:**
  - A full-width band below the proof line, about 160–220 px tall, with no text over the grain.
  - `aria-hidden="true"`, with nothing focusable.
  - Under `prefers-reduced-motion: reduce`, every animation in it is `none`, on a deliberate still frame.
  - Colours:
    - grain: `#232323` (dark) / `#d4d4d4` (light)
    - hairlines: `#2e2e2e` / `#c8c8c8`
    - wave and output rings: `#5a5a5a` / `#8f8f8f`
    - points: `var(--primary)`, with the glow in dark mode only
- **Slice 1 rules still apply:** tokens, focus ring, 44 px targets, no horizontal scroll from 320 px up, the a11y bar, Lighthouse (accessibility 1.0, others ≥ 0.95, target 0.99), no console errors, and no new packages.
- **Merging is a production deploy.** The PR body says so.
- **Environment:** run npm with `npm_config_cache=$TMPDIR/npm-cache`. Run build, e2e, LHCI and git writes outside the sandbox. Scan for `* 2*` conflict copies before each task.

## Review Focus

1. **Reduced motion:** the visual is fully still, and the still frame reads as intentional (pulses visible, waves resting at a nice phase). → Task 3 `reduced motion freezes every animation in the visual` (e2e) plus screenshots.
2. **320 px and 200% zoom:** the band doesn't overflow, doesn't overlap the proof line or buttons, and the copy stays readable. → Task 3 `band sits below the proof line at 320, 375 and 1440 and at 200% zoom`.
3. **Performance:** the animation mustn't hurt CLS or Lighthouse performance; the band reserves its height before paint. → Task 5 LHCI (≥ 0.95, target 0.99) and `hero band has a fixed height in CSS (no layout shift)`.
4. **Light theme:** the grain and lines stay subtle and the magenta points small. → Task 3 screenshots in light, reviewed in the PR.
5. **Facts drift:** a card number that no longer matches the resume. → Task 1 `every number in featured summaries appears in resume.md`.

---

## File structure

```
content/work/ai-document-pipelines.mdx     featured 1
content/work/control-bh.mdx                featured 2
content/work/ulti-health.mdx               featured 3
content/source/resume.md                   Ulti-Health entry replaced
src/lib/content/types.ts                   WorkEntry gains featured, order, label
src/lib/content/load.ts                    parses them; getFeaturedWork()
src/components/home/hero.tsx               hero copy + CTAs + proof + <ThreeEras/>
src/components/home/three-eras.tsx         inline SVG
src/components/home/three-eras.css         visual styles + keyframes + reduced-motion
src/components/home/selected-work.tsx      section#work + cards
src/components/home/about.tsx
src/components/home/contact-cta.tsx
src/app/page.tsx                           composes the sections
tests/unit/content.test.ts, tests/unit/home.test.tsx
tests/e2e/home.spec.ts                     new; Slice 1 specs keep passing
```

---

### Task 1: Work content, loader fields, resume update

**Files:**

- Modify: `src/lib/content/types.ts`, `src/lib/content/load.ts`, `content/source/resume.md`
- Create: the three `content/work/*.mdx` files above, and `tests/fixtures/content/work-featured/*.mdx`
- Test: `tests/unit/content.test.ts`

**Interfaces:**

- **Produces:**
  - `WorkEntry` gains `featured: boolean` (default `false`), `order: number | null` (default `null`) and `label: string | null` (default `null`).
  - `getFeaturedWork(dir = "content/work"): Promise<WorkEntry[]>` returns the entries where `featured && !placeholder`, sorted by `order` ascending.
  - A featured entry without a numeric `order` or a `label` throws `ContentError` (field `order` / `label`).
- **The existing contract is unchanged:** `getWork` still sorts newest first and still returns every entry.

- [ ] **Step 1: Write the failing tests** in `tests/unit/content.test.ts`:

```ts
test("getFeaturedWork returns featured, non-placeholder entries by order", async () => {
  const w = await getFeaturedWork(`${F}/work-featured`);
  expect(w.map((e) => e.slug)).toEqual(["first", "second"]); // fixture has order 1,2 + an unfeatured + a featured placeholder
  expect(w[0]).toMatchObject({ featured: true, order: 1, label: "AI · 2025–26" });
});
test("featured entry without order fails loudly", ...) // field: "order"
test("non-featured entries default featured=false, order=null, label=null", ...)
test("real featured work matches the approved cards", async () => {
  const w = await getFeaturedWork();
  expect(w.map((e) => [e.label, e.title, e.summary])).toEqual([
    ["AI · 2025–26", "AI document pipelines", "I built AI pipelines for 10+ clients. Manual review dropped 50%."],
    ["Web · 2024–25", "C.O.N.T.R.O.L. BH", "I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%."],
    ["AI · Mobile · 2025–26", "Ulti-Health", "I built a wellness app that plans workouts and meals from the user's own data."],
  ]);
});
test("every number in featured summaries appears in resume.md", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  for (const e of await getFeaturedWork())
    for (const n of e.summary.match(/\d[\d,]*\+?%?/g) ?? []) expect(resume, `${e.slug}: ${n}`).toContain(n.replace(/%$/, ""));
});
test("resume Ulti-Health entry uses the approved stack", async () => {
  const resume = await readFile("content/source/resume.md", "utf8");
  expect(resume).toContain("Expo (React Native) and Supabase");
  expect(resume).not.toMatch(/Kotlin Multiplatform|Swift|Tower middleware|Fly\.io/);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL (`getFeaturedWork` isn't exported, and the content is missing).
- [ ] **Step 3: Implement.**
  - **Loader:** add the fields to `toWork` (a `bool` for `featured`, a new `num` reader for `order`, and an optional string for `label`), plus the featured check and `getFeaturedWork`.
  - **Entries:** write the three `.mdx` files from the Global Constraints. Use `date` = YYYY-MM of the role's end (2026-01, 2025-12, 2026-05) and appropriate `tags`. Each body is `TODO(kyle): Slice 03 detail copy.`
  - **Resume:** replace the Ulti-Health entry in `resume.md` with the spec's approved text, verbatim.
- [ ] **Step 4:** Run `npm test`. Expected: PASS, with the Slice 1 tests still green.
- [ ] **Step 5: Commit.** `feat(content): featured work entries and loader fields; Ulti-Health resume update`

---

### Task 2: Hero copy and calls to action

**Files:**

- Create: `src/components/home/hero.tsx`, `tests/unit/home.test.tsx`
- Modify: `src/app/page.tsx` (render `<Hero/>` for now)

**Interfaces:**

- **Produces:** `Hero(): JSX.Element`, a server component with a `<section aria-labelledby="hero-title">` and the h1 `id="hero-title"`. It renders a `{/* visual */}` slot where Task 3 places `<ThreeEras/>`.

- [ ] **Step 1: Write the failing tests** (`tests/unit/home.test.tsx`):

```tsx
test("hero: label, h1, lead, proof line verbatim", () => {
  render(<Hero />);
  expect(
    screen.getByText("Open to work · AI / Software Engineer"),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "I'm Kyle Whynott, an AI engineer.",
  );
  expect(
    screen.getByText(/^I understand AI systems end to end\./),
  ).toHaveTextContent(LEAD);
  expect(screen.getByText(PROOF)).toBeInTheDocument();
});
test("hero CTAs: accent Get in touch → /contact, quiet See my work → #work", () => {
  render(<Hero />);
  const primary = screen.getByRole("link", { name: "Get in touch →" });
  expect(primary).toHaveAttribute("href", "/contact");
  expect(primary.className).toContain("bg-primary");
  const secondary = screen.getByRole("link", { name: "See my work" });
  expect(secondary).toHaveAttribute("href", "#work");
  expect(secondary.className).not.toMatch(/bg-primary|text-keyword/);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `Hero`.**
  - **Layout:** centred, `px-gutter`, with the top padding clearing the pill. The micro-label is a `micro-label` span with an accent dot (`bg-primary`, with `accent-glow` in dark).
  - **Text:** the h1 uses `text-hero font-bold tracking-tight`, the lead `text-body-fluid text-muted-foreground max-w-xl`, and the proof line `micro-label text-muted-foreground`.
  - **Calls to action:** `<Link>` styled with `buttonVariants`, both at least `h-11`.
  - **Arrow:** "→" is part of the visible text. The accessible name `Get in touch →` is fine; it's what's on screen.
- [ ] **Step 4:** Run `npm test`, then `npm run build`. Expected: PASS and exit 0.
- [ ] **Step 5: Commit.** `feat(home): hero copy and calls to action`

---

### Task 3: The "three eras" visual band (SVG + CSS)

**Files:**

- Create: `src/components/home/three-eras.tsx`, `src/components/home/three-eras.css`, `tests/e2e/home.spec.ts` (visual section)
- Modify: `src/components/home/hero.tsx` (render `<ThreeEras/>` below the proof line), `tests/unit/home.test.tsx`

**Interfaces:**

- **Produces:** `ThreeEras(): JSX.Element`, a `<div className="three-eras" aria-hidden="true">` with one inline `<svg>`.
- **Class hooks for tests:** `.te-grain`, `.te-light`, `.te-analog`, `.te-digital`, `.te-net`, `.te-point`.

- [ ] **Step 1: Write the failing tests.**

Unit (`home.test.tsx`):

```tsx
test("visual is decorative: aria-hidden, nothing focusable, sits after the proof line", () => {
  const { container } = render(<Hero />);
  const v = container.querySelector(".three-eras")!;
  expect(v).toHaveAttribute("aria-hidden", "true");
  expect(v.querySelectorAll("a,button,[tabindex]").length).toBe(0);
  expect(
    screen.getByText(PROOF).compareDocumentPosition(v) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
```

E2e (`tests/e2e/home.spec.ts`):

```ts
test("reduced motion freezes every animation in the visual", ...)            // context reducedMotion:"reduce": every element under .three-eras has computed animation-name "none"
test("visual animates by default", ...)                                       // document.getAnimations() includes animations whose target is inside .three-eras
test("band sits below the proof line at 320, 375 and 1440 and at 200% zoom", ...) // band.top >= proof.bottom; no horizontal scroll
test("hero band has a fixed height in CSS (no layout shift)", ...)             // band height identical at DOMContentLoaded and after load; between 160 and 220 px at 1440
test("points use the accent; grain and lines don't", ...)                     // .te-point fill === computed --primary; .te-grain fill is not
```

- [ ] **Step 2:** Run `npm test` and `npx playwright test tests/e2e/home.spec.ts --project=desktop`. Expected: FAIL.
- [ ] **Step 3: Implement.** Follow the approved v2 mockup's look, rebuilt in SVG:
  - **Grain:** `<pattern>` with 2×2 dots on a 3 px grid (`.te-grain`). It's masked by a `<radialGradient>` "light" group (`.te-light`) that drifts with a `transform` keyframe over 9–13 s, alternating. The dots are fixed and the light moves.
  - **Analog wave:** a sine path drawn at twice the width inside a `clipPath`, translated by one period with `linear infinite`, so the loop is seamless.
  - **Digital wave:** a square-wave path, same technique, in its own `clipPath`. The boundary between analog and digital stays fixed.
  - **Network:** hub → 4 nodes → 2 outputs, as hairlines and rings.
  - **Points:** three `.te-point` circles moving along `offset-path: path(...)` with `offset-distance` keyframes: one on the wave, two in the network. Glow via CSS `filter: drop-shadow`, inside `.dark` only.
  - **Sizing:** `viewBox` with `preserveAspectRatio="xMidYMid slice"`. The band's height is `clamp(160px, 18vw, 220px)`. Below 400 px the network simplifies (2 middle nodes are hidden by CSS).
  - **Reduced motion:** `@media (prefers-reduced-motion: reduce) { .three-eras * { animation: none !important; } }`, with resting positions chosen so the still frame looks deliberate. Set the points' `offset-distance` start values in CSS.
  - **Colours:** CSS variables scoped to `.three-eras`, set from the Global Constraints values for `:root` (light) and `.dark`.
- [ ] **Step 4:** Run the same commands. Expected: PASS. Then take screenshots of the hero in dark, light and reduced motion at 375 and 1440 into the scratchpad, look at them, and compare against the v2 mockup. Fix anything that looks cheap before committing.
- [ ] **Step 5: Commit.** `feat(home): three eras visual band (SVG + CSS, reduced-motion still)`

---

### Task 4: Selected work, About, Contact; compose the page

**Files:**

- Create: `src/components/home/selected-work.tsx`, `about.tsx`, `contact-cta.tsx`
- Modify: `src/app/page.tsx`, `tests/unit/home.test.tsx`, `tests/e2e/home.spec.ts`

**Interfaces:**

- **Consumes:** `getFeaturedWork()` (Task 1) and `Hero` (Task 2).
- **Produces:**
  - `SelectedWork({ entries }: { entries: WorkEntry[] }): JSX.Element`, a `<section id="work" aria-labelledby="work-title">` with an h2 "Selected work" and a `<ul>` of cards.
  - `About(): JSX.Element`, with an h2 "About".
  - `ContactCta(): JSX.Element`, with an h2 "Contact".
  - `page.tsx` is `async` and renders Hero, `SelectedWork` (with `await getFeaturedWork()`), About and ContactCta, in that order.

- [ ] **Step 1: Write the failing tests.**

Unit:

```tsx
test("SelectedWork renders one linked card per entry with label, title, summary", () => {
  render(<SelectedWork entries={FIXTURE_THREE} />);
  const cards = screen.getAllByRole("link");
  expect(cards).toHaveLength(3);
  cards.forEach((c) => expect(c).toHaveAttribute("href", "/work"));
  expect(cards[0]).toHaveTextContent("AI · 2025–26");
  expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeInTheDocument();
});
test("About and Contact copy verbatim; Contact CTA is accent → /contact", ...)
test("no generational label anywhere on Home", ...) // render all sections; textContent !~ /zillennial|millennial|gen z/i
```

E2e (`home.spec.ts`):

```ts
test("Home sections appear in order: hero, Selected work, About, Contact", ...) // h1 then h2s ["Selected work","About","Contact"]
test("See my work scrolls to #work and the section heading is visible below the pill", ...)
test("all three cards link to /work and are keyboard reachable with visible focus", ...)
test("both Get in touch buttons go to /contact", ...)
```

- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Sections:** `max-w-5xl px-gutter py-section`, with h2s in `text-h2 font-bold tracking-tight`.
  - **Cards:** a bordered `rounded-xl` grid, 1 column on mobile and 3 at `md`, each card a single `<Link>`. Inside: `micro-label` label, `text-h3` title, muted summary. On hover the border goes to `border-foreground/30`. Focus uses the global ring.
  - **Contact:** a bordered box with the sentence and the accent `Button` link.
  - **Page:** remove the placeholder text from `page.tsx`.
- [ ] **Step 4:** Run `npm test` and the e2e suite. Expected: PASS, with the Slice 1 specs still green (Home has exactly one h1, and the hero h1 sizes still pass).
- [ ] **Step 5: Commit.** `feat(home): selected work, About and Contact sections`

---

### Task 5: Full quality pass

- [ ] **Step 1:** Run `npm run lint && npm run format:check && npm run typecheck && npm test && npm run test:e2e && npm run lhci`. Expected: all green; axe zero on `/` in both themes; Lighthouse accessibility 1.0 and the rest ≥ 0.95 (aim for 0.99 and fix any warning).
- [ ] **Step 2:** Run the e2e suite twice more, plus `home.spec.ts --repeat-each=10`. Expected: no flakes.
- [ ] **Step 3: Keyboard pass and screenshots.** At 375 and 1440, in both themes and with reduced motion, save screenshots to the scratchpad for the PR, and record the keyboard pass.
- [ ] **Step 4: Commit any fixes** with their tests. Message: `fix(home): …` per fix.

---

### Task 6: PR

- [ ] **Step 1:** Write `docs/plans/slice-02-pr.md` covering:
  - a summary and the preview URL (`portv3-git-slice-02-home-kynot54s-projects.vercel.app`)
  - test and Lighthouse evidence, and the screenshots
  - **⚠️ Merging deploys to production (`kwhynott.dev`).**
  - the `TODO(kyle)` list, "Needs Kyle's call" and "Conflicts flagged" (the spec's two rule changes)
  - the deferred minors carried from Slice 1
- [ ] **Step 2:** Push, then run `gh pr create --base main --head slice/02-home --title "Slice 02: Home" --body-file docs/plans/slice-02-pr.md`, ending the body with the attribution line. Expected: a PR URL, and the CI `quality` check plus Vercel previews pass.
- [ ] **Step 3:** Run an independent whole-branch review (the superpowers final-review step). Fix Critical and Important findings with tests, and list the minors in the PR.
- [ ] **Step 4:** Update `docs/plans/CHECKPOINT.md` to "Slice 2 PR open, awaiting Kyle's review", then commit and push.

## Self-review notes

- **Spec coverage:** every spec item maps to a task:
  - page order and headings (4)
  - hero copy and calls to action (2)
  - the visual's look, motion, reduced motion, placement and colours (3)
  - work entries and fields (1)
  - About and Contact (4)
  - the resume update (1)
  - the rule changes (6, as conflicts)
  - the non-goals: cards link to `/work`, no headshot (4)
- **Names:** `getFeaturedWork`, `featured` / `order` / `label`, `ThreeEras`, `.three-eras`, `#work` and `hero-title` are used the same way in every task.
- **Execution:** Kyle used Native for Slice 1. Confirm it again.
