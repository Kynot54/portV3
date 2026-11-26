# Design tokens

The source is `src/app/globals.css`. This doc explains the tokens, and `tests/unit/design-tokens-doc.test.ts` fails if the colour table below and the CSS disagree. The rationale is in `docs/superpowers/specs/2026-11-25-slice-01-foundation-design.md`.

**The idea: isolation.** The accent is the only loud colour on a screen. Everything else is black, white and grey. Blue is a quiet helper, used only for focus, link underlines and keywords.

## Colour

The theme is a class on `<html>` (`.dark` or `.light`), set by next-themes. Dark is the default and is what the server renders. Light tokens live in `:root`, dark tokens in `.dark`. Contrast ratios are WCAG 2.x, measured against the theme's `--background` unless noted.

| Token                    | Dark    | Light   | Contrast (dark / light)       | Use                                      |
| ------------------------ | ------- | ------- | ----------------------------- | ---------------------------------------- |
| `--background`           | #000000 | #FFFFFF | —                             | Page background                          |
| `--foreground`           | #F5F5F5 | #0A0A0A | 19.3 / 19.8                   | Body text                                |
| `--muted-foreground`     | #8A8A8A | #6B6B6B | 6.1 / 5.3                     | Secondary text, micro-labels             |
| `--primary`              | #39FF14 | #FF0080 | light: 3.8 vs page (UI ≥ 3:1) | **The accent** (see rules)               |
| `--primary-foreground`   | #000000 | #000000 | 15.5 / 5.6 on `--primary`     | Text on the accent                       |
| `--ring`                 | #60A5FA | #1D4ED8 | 8.3 / 6.7                     | Focus outline                            |
| `--keyword`              | #60A5FA | #1D4ED8 | 8.3 / 6.7                     | Keywords, link underlines                |
| `--card`                 | #0A0A0A | #FFFFFF | —                             | Card surface                             |
| `--card-foreground`      | #F5F5F5 | #0A0A0A | 18.1 / 19.8 on card           | Card text                                |
| `--secondary`            | #171717 | #F5F5F5 | —                             | Quiet surfaces                           |
| `--muted`                | #171717 | #F5F5F5 | —                             | Muted surfaces                           |
| `--accent`               | #171717 | #F5F5F5 | —                             | shadcn hover surface, **not** our accent |
| `--border`               | #262626 | #E5E5E5 | decorative                    | Borders, dividers                        |
| `--input`                | #262626 | #E5E5E5 | decorative                    | Input borders                            |
| `--destructive`          | #F87171 | #DC2626 | 7.6 / 4.8                     | Errors only                              |
| `--tag-ai`               | #22D3EE | #155E75 | dark vs page / light vs fill  | Blog tag: AI                             |
| `--tag-ai-fill`          | #000000 | #CFFAFE | —                             | Blog tag fill: AI                        |
| `--tag-engineering`      | #FDE047 | #854D0E | dark vs page / light vs fill  | Blog tag: Engineering                    |
| `--tag-engineering-fill` | #000000 | #FEF9C3 | —                             | Blog tag fill: Engineering               |
| `--tag-career`           | #C084FC | #6B21A8 | dark vs page / light vs fill  | Blog tag: Career                         |
| `--tag-career-fill`      | #000000 | #F3E8FF | —                             | Blog tag fill: Career                    |
| `--tag-business`         | #FB923C | #9A3412 | dark vs page / light vs fill  | Blog tag: Business (HR, finance, …)      |
| `--tag-business-fill`    | #000000 | #FFEDD5 | —                             | Blog tag fill: Business                  |
| `--tag-notes`            | #FB7185 | #9F1239 | dark vs page / light vs fill  | Blog tag: Notes                          |
| `--tag-notes-fill`       | #000000 | #FFE4E6 | —                             | Blog tag fill: Notes                     |

The greys (card, secondary, muted, border, input) are first-pass values. Kyle tunes them after seeing the preview.

### Accent rules

- **Three uses only:** the Contact nav pill, the page's main call to action, and the "Open to work" dot.
- **Text on the accent** is always black.
- **Dark mode:** a static glow. `--glow` is `0 0 22px rgba(57,255,20,.55), 0 0 2px rgba(57,255,20,.9)`, and `--glow-strong` on hover. Use the `accent-glow` utility.
- **Light mode:** a flat magenta fill with no border and no glow.
- **States:** hover is `brightness-110`, press is `brightness-95`. Nothing moves or scales.
- **The secondary button** is the `outline` variant: a quiet grey that is never blue and never the accent.

### Tag colours (Kyle, 2026-11-26)

- **Blog tag chips only,** coloured by category (`src/lib/tag-categories.ts`). A tag with no category stays grey.
- **Dark:** neon text and a 45% border in the category colour on black. No fill, no glow.
- **Light:** a pastel fill with deep text in the same hue. Every pair is ≥ 4.5:1 (unit-tested).
- **Never** the accent green or magenta, the keyword blue, or the error red. This is a flagged exception to "no loud colours competing with the accent."

### Blue rules

- **Focus:** a 2px solid `--ring` outline with a 2px offset on every interactive element.
- **Links in text:** the `link` utility gives body-colour text with a 1.5px `--keyword` underline.
- **Keywords:** `<Keyword>` gives blue text with no underline and normal weight, used for a few key terms per section.

## Type

The fonts are **Geist** (`font-sans`, the default) and **Geist Mono** (`font-mono`), loaded through `next/font/google`. The scale is fluid, using `clamp()` between about 320 px and 1440 px.

| Utility                      | Size                                    | Line height | Use                                                                         |
| ---------------------------- | --------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `text-micro` / `micro-label` | 0.75rem                                 | 1rem        | Mono uppercase labels (`micro-label` adds mono, 0.14em tracking, uppercase) |
| `text-body-fluid`            | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) | 1.6         | Body copy                                                                   |
| `text-h3`                    | clamp(1.125rem, 1rem + 0.6vw, 1.375rem) | 1.3         | Card and section titles                                                     |
| `text-h2`                    | clamp(1.5rem, 1.2rem + 1.5vw, 2rem)     | 1.2         | Section headings                                                            |
| `text-hero`                  | clamp(1.875rem, 1.2rem + 3vw, 2.75rem)  | 1.1         | Page h1 and hero                                                            |

## Spacing

Tailwind's default 4px scale (`p-4`, `gap-6` and so on) covers components. Two fluid tokens cover layout:

| Token               | Value                  | Utilities                  |
| ------------------- | ---------------------- | -------------------------- |
| `--spacing-gutter`  | clamp(1rem, 4vw, 2rem) | `px-gutter`, `mx-gutter`   |
| `--spacing-section` | clamp(3rem, 8vw, 6rem) | `py-section`, `mt-section` |

There are no fixed pixel widths or heights for layout. Containers use `max-w-*` with `px-gutter`, and tall sections use `dvh`/`svh`.

## Radii

| Token                              | Value                                   |
| ---------------------------------- | --------------------------------------- |
| `--radius` (`rounded-lg`)          | 0.625rem                                |
| `rounded-sm` / `md` / `xl` / `2xl` | 0.6× / 0.8× / 1.4× / 1.8× of `--radius` |
| Pills (nav, Contact)               | `rounded-full`                          |

## Motion

Motion is short and functional only. Under `prefers-reduced-motion: reduce`, every animation and transition drops to 0s. The glow is static, so it isn't motion.
