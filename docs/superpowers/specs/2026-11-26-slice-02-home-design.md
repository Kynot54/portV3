# Slice 02 — Home: Design

**Date:** 2026-11-26 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md`. The design system is in `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md` and `docs/design-tokens.md`. This doc adds the Home decisions; where it differs from those docs, the difference is listed under "Rule changes".

## Intent

Home is the page a hiring manager lands on. Within seconds it has to say "AI / software engineer, open to work", then back that up: real results first, then who Kyle is, then a clear way to get in touch. The voice is Kyle's: first person, short sentences, plain words, objective, with no selling adjectives. The secondary audience is older decision-makers. The About section speaks to them by *showing* Kyle's experience across analog, digital and AI. It never applies a generational label.

## Goals

1. A hero with the open-to-work note, Kyle's heading and lead, primary and secondary calls to action, a proof line, and the animated "three eras" visual.
2. Selected work: three real projects from `content/work/`, each with a one-line result in Kyle's voice.
3. An About section in Kyle's approved words.
4. A closing contact call to action.
5. `content/source/resume.md` updated with the corrected Ulti-Health entry.
6. The Slice 1 quality bar on everything: axe zero, Lighthouse 0.99–1.0 (accessibility 1.0), the responsive rules, reduced motion, keyboard support, and no console errors.

## Non-goals

- The `/work` list and detail pages (Slice 3). Cards link to `/work` until then.
- Blog (Slice 4), and the contact form and booking (Slice 5). "Get in touch" links to the `/contact` placeholder.
- SEO, Open Graph images and the sitemap (Slice 6). Home keeps the root metadata.
- A headshot. V2's `profile.webp` isn't used on Home in this slice.

## Anti-goals

- **Selling language, or any fact not in `resume.md`.** Every number on the page must trace to the resume.
- **The word "Zillennial", or any generational label.** The idea is hinted at through experience only.
- **A visual that looks cheap.** The first dither mockup was rejected for chunky full-brightness pixels. The visual is restrained: dim grain, hairlines, and accent only on tiny moving points.
- **Motion for visitors who asked for less.** Under `prefers-reduced-motion: reduce`, the visual is completely still.
- **The visual competing with the text.** It sits low in the hero, behind or below the copy, and never reduces the text's contrast.

## Constraints

- Every Slice 1 constraint applies: palette and tokens, focus ring, `scroll-padding-top`, 44 px tap targets, no horizontal scroll from 320 px up (including landscape phones and 200% zoom), Cache Components, and **no new packages**.
- Copy is fixed as approved below. Any change is Kyle's call.
- The facts come from `content/source/resume.md` as updated in this slice.

## Approaches considered (hero visual)

| | Approach | Trade-off |
|---|---|---|
| A | Canvas 2D, drawn every frame by a client component | Matches the mockup exactly, but runs a JavaScript animation loop on the main thread |
| B | Static SVG with CSS pulses, fixed grain | Lightest, but the grain can't drift and the wave can't scroll, so it loses the "alive" quality |
| C | WebGL shader | Most fidelity, but far more code, risk and battery cost for a background element |
| **D ✔** | **SVG + CSS, animated by the browser** | **No JavaScript, smooth on the graphics hardware, sharp at any size. The grain dots stay fixed and brighten or dim as the light drifts over them (a halftone feel) instead of popping in and out** |

**Kyle picked D.**

## Decisions (Kyle's)

### Page order
Hero → Selected work (`id="work"`) → About → Contact call to action. The Slice 1 header and footer stay as they are.

### Hero
```
            ● OPEN TO WORK · AI / SOFTWARE ENGINEER
               I'm Kyle Whynott, an AI engineer.
   I understand AI systems end to end. I fit them into how a
   business actually works. I design the system first, then
   build the automations and software around it.
          [█ Get in touch → █]   [ See my work ]
 TAUGHT ML AT CAL STATE FULLERTON · AI PIPELINES FOR 10+ CLIENTS · M.S. SOFTWARE ENGINEERING
   ∿∿∿∿∿⊓⊔⊓⊔⊓ ─◯⟨ network ⟩         ← three eras visual
```
- **Micro-label:** an accent dot plus `Open to work · AI / Software Engineer`, in the `micro-label` style. The dot is static, with the glow in dark mode only.
- **`<h1>`:** "I'm Kyle Whynott, an AI engineer."
- **Lead:** "I understand AI systems end to end. I fit them into how a business actually works. I design the system first, then build the automations and software around it."
- **Calls to action:**
  - **Get in touch →** is the accent `Button` and links to `/contact`.
  - **See my work** is the quiet `outline` `Button` and links to `#work` on the same page.
- **Proof line:** "Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering", in `micro-label` style. Every claim is on the resume.
- **Layout:** centred, as in the approved mockup.

### The three eras visual (option D)
- **The story:** one hairline runs left to right. It's a smooth **analog** sine wave, then a **digital** square wave, then it joins a hub that branches into a small **AI** network (hub → 4 nodes → 2 outputs). It tells the analog → digital → AI story without words.
- **Look** (from the approved v2 mockup):
  - **Grain:** a fine dot grid (about 2 css px dots), dim: `#232323` on black, `#d4d4d4` on white.
  - **Light:** a soft light drifts slowly across the grain, so the dots brighten and dim. It's strongest low in the hero and fades out toward the text.
  - **Lines:** 1 px hairlines in dim grey, with the wave a little stronger.
  - **Nodes:** small rings filled with the page background.
  - **Accent:** only on the travelling data points, which glow in dark mode only.
- **Motion** (CSS only):
  - The analog and digital parts each scroll sideways inside their own clipped frame. Each path is drawn at twice the width and translated, so the loop is seamless and the change from wave to square stays put.
  - One pulse travels along the wave, and two travel through the network, using CSS `offset-path`.
  - The light drifts on a slow transform loop of 9–13 s.
  - Only `transform`, `opacity` and `offset-distance` are animated.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, every animation stops on a well-composed still frame. Pulses stay visible in sensible positions.
- **Accessibility:** it's decorative (`aria-hidden="true"`, no focusable parts). It never sits under body text at a contrast that would fail.
- **Theming:** colours come from CSS variables, so dark and light just work.

### Selected work
- **The three entries**, as real `content/work/*.mdx` files, shown in this order:

| Order | Card label | Title | Card line (Kyle's voice, approved) |
|---|---|---|---|
| 1 | `AI · 2025–26` | AI document pipelines | I built AI pipelines for 10+ clients. Manual review dropped 50%. |
| 2 | `Web · 2024–25` | C.O.N.T.R.O.L. BH | I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%. |
| 3 | `AI · Mobile · 2025–26` | Ulti-Health | I built a wellness app that plans workouts and meals from the user's own data. |

- **Facts behind them:**
  - Working Entrepreneurs, Oct 2025 – Jan 2026: "10+ clients" and "manual review down by 50%".
  - C.O.N.T.R.O.L. BH, Aug 2024 – Dec 2025: "1,000+ users" and "donation volume +40%".
  - Ulti-Health, Jul 2025 – May 2026.
- **Cards:** each is one link (the whole card) to `/work`, until Slice 3 adds `/work/[slug]`. The section heading is "Selected work".
- **The placeholder entry** (`content/work/placeholder-project.mdx`) is never shown on Home.

### About
> I grew up with analog, came of age with digital, and adapted and evolved with AI. I've lived with all three, so I can explain each one plainly and connect them. I designed and taught a machine learning course to 40+ students at Cal State Fullerton, and I've taught C++ from object-oriented design up to data structures.

The first sentence is Kyle's own wording, used verbatim.

### Contact call to action
> I'm looking for my next role as an AI or software engineer. Let's talk.

It's followed by **Get in touch →** (the accent `Button`, linking to `/contact`).

### `resume.md`: Ulti-Health (replaces the current entry)
> **Ulti-Health** · July 2025 – May 2026
> - Built a wellness app MVP with Expo (React Native) and Supabase: Auth, input validation, pgvector, and Edge Functions. Docker.
> - Recommends workout plans, nutrition plans that avoid the user's allergies, and sleep suggestions from the user's own data. Mental-health questions are pointed to verified resources.
> - Covers mental and physical wellness: an on-device journal with encrypted cloud backups, a colour mood pad, and sleep, nutrition, and fitness logs with a heatmap of muscles worked and effort.
> - Led architecture, design, and cross-platform implementation.

Kotlin Multiplatform, Swift, Rust/Tower, GitHub Actions and Fly.io are removed (dropped for the MVP, per Kyle). Kyle's 2027 launch plans stay off the site.

## Rule changes (vs. the Slice 1 design system)

1. **The accent's "three uses only" rule, clarified:** "the page's main call to action" covers every instance of that call to action. Home shows **Get in touch** twice (hero and closing), and both are accent. The accent's uses on Home are therefore: the Contact nav pill, the Get in touch buttons, the open-to-work dot, and the travelling data points in the hero visual. Kyle approved those pulses in the mockup. Nothing else on Home is accent.
2. **The animation exception:** the hero visual animates continuously, which is the one ongoing motion on the site. Nothing flashes, it's slow, and it stops completely under reduced motion.

## Left to the builder

- Component and file names, and the work frontmatter additions (for example `featured: boolean`, `order: number`, `label: string`). Extend the Slice 1 loader with tests, without breaking its current contract.
- The exact SVG geometry, animation durations within the spirit above, and the grain technique (an SVG `<pattern>` or a tiled data-URI image), plus the drifting light (a radial gradient layer moved with `transform`).
- How the visual scales: full width, with height about 160–220 px, scaling with the viewport. At 320 px it may simplify (for example, fewer network nodes), but it must not overflow.
- Section spacing (the `py-section` / `px-gutter` tokens) and the card styling within the design system: bordered cards, mono label, `text-h3` title, muted line, a hover state that brightens the border, and the global focus ring.
- Tests: unit tests for the loader additions and the content order; e2e tests for the hero copy, CTA targets, the `#work` anchor and focus, all three cards and their links, About and the contact CTA, plus a check that the visual is `aria-hidden` and that under reduced motion every animation is `none` or paused. axe, responsive and Lighthouse runs, with screenshots of the visual in both themes for Kyle.

## Review focus

1. **Reduced motion:** the visual is completely still, and the still frame looks intentional.
2. **The visual at 320 px and 200% zoom:** no overflow, and it never overlaps or lowers the contrast of the copy or buttons.
3. **Performance:** CSS animation must not drag down Lighthouse performance or CLS. The SVG must be light, and the grain cheap to draw.
4. **Light theme:** the grain and lines stay subtle on white, and the magenta pulses stay small.
5. **Facts:** every number on the page matches `resume.md`.
