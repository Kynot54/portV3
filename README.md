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

## After a production deploy

Vercel's bot challenge blocks automated checks against the live site, so these are manual:

1. **LinkedIn Post Inspector** on `https://kwhynott.dev` and one project: no warnings, card shows.
2. **Google Search Console:** sitemap `https://kwhynott.dev/sitemap.xml` submitted; URL Inspection on `/` passes.
3. **Live `/contact` with DevTools open:** send a message, press Book a call, toggle the theme. There should be no "Refused to…" (CSP) errors.

## License

The code is [MIT](LICENSE). Writing, images and other personal content (`content/`, `public/images/`) are all rights reserved.
