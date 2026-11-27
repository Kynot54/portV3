# kwhynott.dev

The source for my portfolio, [kwhynott.dev](https://kwhynott.dev). I'm Kyle Whynott, an AI and software engineer. This is V3, a multi-page site being built in slices; V2 stays live until it's ready.

## Stack

- Next.js (App Router), TypeScript (strict), Tailwind CSS
- shadcn/ui on Base UI, next-themes for light and dark
- MDX content in the repo, read by typed loaders in `src/lib/content/`
- Vercel for hosting

## Run it

Needs Node 24 (`.nvmrc`).

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build && npm run start
```

`npm run dev` reads `.env.development`, which holds public test values: Turnstile's test key, Cal.com's demo calendar (for both the intro call and the Services consultation), a fake send, and Services switched on. The contact page works locally with no accounts. `next build` never reads it. The real keys live only in Vercel's Production environment.

**Services:** `/services` exists only when `SERVICES_ENABLED=true`. A production build with it on also needs `NEXT_PUBLIC_CAL_CONSULT_LINK` (the consultation event on Cal.com), or it fails.

| Script                                                        | What it does                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run lint` / `npm run format:check` / `npm run typecheck` | ESLint, Prettier, TypeScript                                                          |
| `npm test`                                                    | Unit tests (Vitest + Testing Library)                                                 |
| `npm run test:e2e`                                            | End-to-end and accessibility tests (Playwright + axe) on Chromium, WebKit and Firefox |
| `npm run lhci`                                                | Lighthouse CI against a production build                                              |

## Quality bar

Every pull request runs the `quality` CI job. It fails on any of:

- lint, format, type or test errors
- an axe accessibility violation, in light or dark
- Lighthouse accessibility below 1.0, or performance, best practices or SEO below 0.95 (the target is 0.99–1.0)

Design tokens and the rules behind them are in [`docs/design-tokens.md`](docs/design-tokens.md).

## Adding project media

Each project can show two images and one optional short clip.

- **Cards:** image 1 is the thumbnail. On a mouse or trackpad, the clip plays while the card is hovered or keyboard-focused, and stops when the pointer or focus leaves. Phones, tablets and anyone with reduced motion on see the still.
- **Project page:** both images near the top. The clip (if any) sits under "See It in Action", with controls, and never starts by itself.

Put the files in `public/images/work/<slug>/`, using the slugs `working-entrepreneurs`, `control-bh`, `video-interview-plugin`, `ulti-health` and `ai-mind-companion`:

| File                        | Spec                                                                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.png`, `2.png` (required) | 1920 × 1080 (16:9), PNG, or JPEG for photo-heavy shots; under about 3 MB each. Image 1 is the card thumbnail, so make it the clearest view.          |
| `clip.mp4` (optional)       | Up to about 20 seconds; 1920 × 1080 or 1280 × 720; H.264 MP4; **no audio track**; under about 5 MB; nothing that flashes more than 3 times a second. |

Then list them in the project's frontmatter, with alt text for each image and a one-line description of the clip:

```yaml
media:
  images:
    - src: 1.png
      alt: "…"
    - src: 2.png
      alt: "…"
  clip: # optional
    src: clip.mp4
    description: "…"
```

The build fails if a file is missing, an image has no alt text, there aren't exactly two images, or a clip has no description.

- **Hide client data** (names, figures, documents), and check that each client is fine with the media being public.
- **Revisit if traffic surges** (Kyle, 2026-11-27): clips are served from this site. If they start to dominate Vercel's bandwidth, move them to a video host. Only the `src` values and the security policy's `media-src` would change.
- **Tests:** `WORK_SAMPLES=1` adds a sample project with generated media (`scripts/make-sample-media.mjs`) to e2e and Lighthouse builds. It never appears in production.

## Before merging a change to headers or third-party embeds

Previews have no env vars, so check the real embeds locally. Build and start with Turnstile's public test key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`), any public Cal link for both `NEXT_PUBLIC_CAL_LINK` and `NEXT_PUBLIC_CAL_CONSULT_LINK`, and `SERVICES_ENABLED=true` (in zsh, export each one separately). Then, on `/contact` and `/services` in Chromium, Firefox and WebKit, focus the form and press the booking button. There should be no "Refused to…" (CSP) errors. The e2e stand-ins can't catch these.

## After a production deploy

Vercel's bot challenge blocks automated checks against the live site, so these are manual:

1. **LinkedIn Post Inspector** on `https://kwhynott.dev` and one project: no warnings, card shows.
2. **Google Search Console:** sitemap `https://kwhynott.dev/sitemap.xml` submitted; URL Inspection on `/` passes.
3. **Live `/contact` with DevTools open:** send a message and press Book a call. There should be no "Refused to…" (CSP) errors; this is the only check of Cloudflare's analytics beacon.

## License

The code is [MIT](LICENSE). Writing, images and other personal content (`content/`, `public/images/`) are all rights reserved.
