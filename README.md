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

## Adding project screenshots

Each project page shows one image in a 16:9 frame, at most 768 CSS px wide. A 4K monitor at 200% scaling or a Retina screen draws that frame with 1536 actual pixels, and high-end phones need about 1100.

- **Size:** 1920 × 1080 (exactly 16:9; at least 1600 × 900).
- **Format:** PNG for interface shots, a high-quality JPEG for photo-heavy ones. Under about 3 MB.
- **One file per project.** Next's image component makes the AVIF and WebP copies at each size.
- **Place:** `public/images/work/<slug>.png`, using the slugs `working-entrepreneurs`, `control-bh`, `video-interview-plugin`, `ulti-health` and `ai-mind-companion`.
- **Phone apps:** place one or two phone screens on a 16:9 canvas.
- **Hide client data** (names, figures, documents), and check that each client is fine with the image being public.
- **Alt text:** each image needs a one-line description.

## Before merging a change to headers or third-party embeds

Previews have no env vars, so check the real embeds locally. Build and start with Turnstile's public test key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`), any public Cal link for both `NEXT_PUBLIC_CAL_LINK` and `NEXT_PUBLIC_CAL_CONSULT_LINK`, and `SERVICES_ENABLED=true` (in zsh, export each one separately). Then, on `/contact` and `/services` in Chromium, Firefox and WebKit, focus the form and press the booking button. There should be no "Refused to…" (CSP) errors. The e2e stand-ins can't catch these.

## After a production deploy

Vercel's bot challenge blocks automated checks against the live site, so these are manual:

1. **LinkedIn Post Inspector** on `https://kwhynott.dev` and one project: no warnings, card shows.
2. **Google Search Console:** sitemap `https://kwhynott.dev/sitemap.xml` submitted; URL Inspection on `/` passes.
3. **Live `/contact` with DevTools open:** send a message and press Book a call. There should be no "Refused to…" (CSP) errors; this is the only check of Cloudflare's analytics beacon.

## License

The code is [MIT](LICENSE). Writing, images and other personal content (`content/`, `public/images/`) are all rights reserved.
