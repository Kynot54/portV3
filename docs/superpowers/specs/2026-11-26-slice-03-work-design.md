# Slice 03 — Work: Design

**Date:** 2026-11-26 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md`. Builds on the Slice 1 and 2 designs (`docs/superpowers/specs/`) and `docs/design-tokens.md`.

## Intent

The `/work` pages let a hiring manager go one level deeper than a Home card. For each project, they should come away knowing three things (Kyle's words):

1. the **business or practical impact**
2. **what the product looks like** (a short clip or photo)
3. a **brief summary of the tools and technologies** used

The copy is in Kyle's voice: objective, first person, short sentences, and only facts from `content/source/resume.md`.

## Goals

1. **`/work`:** a list of all five projects, as cards in the Home style, each linking to its detail page.
2. **`/work/[slug]`:** one static detail page per project, with:
   - the label and title
   - the summary
   - a media slot
   - Impact (or "What it does")
   - What I built
   - Built with
   - role, place and dates
3. **MDX:** brought in now, using `@mdx-js/mdx` (Kyle approved the package), to render each project's "What I built" prose. The Blog reuses it in Slice 4.
4. **Home cards** link to `/work/[slug]`.
5. **Content and resume updates:** two new entries, a corrected client count, and the AI Mind Companion facts.
6. **The quality bar from Slices 1–2:** axe zero, Lighthouse 0.99–1.0 (accessibility 1.0), the responsive rules, keyboard support, no console errors.

## Non-goals

- Real screenshots or clips. Kyle has none on hand, so each page ships a **clearly marked placeholder** in the media slot.
- Filtering, tags pages, search, or prev/next navigation.
- Open Graph images and the sitemap (Slice 6). Each page does get its own `<title>` and description.
- The Blog (Slice 4). It only reuses the MDX renderer built here.

## Anti-goals

- **Invented facts or numbers.** Every number on these pages traces to an exact phrase in `resume.md`.
- **Medical claims.** AI Mind Companion "flags possible early signs of dementia". It never claims to "detect" or "diagnose".
- **A placeholder that looks broken or unprofessional.** The site is live, and merging deploys straight to it.

## Constraints

- All Slice 1 and 2 constraints apply. The only new package is `@mdx-js/mdx` (approved).
- Pages are statically generated (`generateStaticParams`), and unknown slugs return 404. Content reads are cached with `"use cache"` and `cacheLife("max")`, because content only changes on deploy.
- **Merging deploys to `kwhynott.dev`.** This includes Home's proof-line change from "10+" to "50+".

## Approaches considered (MDX rendering)

| | Approach | Trade-off |
|---|---|---|
| **A ✔** | **`@mdx-js/mdx` compiles the loader's `body` at build time** | **One official package. Reuses the validating loader. About 20 lines of our own code. Serves the Blog too** |
| B | `@next/mdx` plugin | Doesn't understand our frontmatter, so it needs 2–3 extra plugins and build config, and it bypasses the loader's validation |
| C | `next-mdx-remote` | Popular, but its maintenance status is uncertain |

**Kyle picked A.**

## Decisions

### Content model (builder's call, stated in the conversation)
- **New frontmatter fields on work entries:**
  - `role`: string, required
  - `location`: string, required
  - `period`: string, required, e.g. "Oct 2025 – Jan 2026"
  - `impactHeading`: "Impact" or "What it does"
  - `impact`: string[], one point per item
  - `tools`: string[]
- **The body** holds only the "What I built" prose, in MDX.
- **Validation:** the loader requires the new fields on every non-placeholder entry and fails loudly when one is missing, just like the existing fields.
- **The placeholder entry** (`placeholder-project.mdx`) stays excluded from every list and page.

### The five projects (approved copy)

**List order:** the three featured projects in their Home order, then O'Hagan, then AI Mind Companion.

**1 · `ai-document-pipelines`**
- **Label:** AI · 2025–26 · **Title:** AI document pipelines
- **Summary:** I built AI pipelines for 50+ clients. Manual review dropped 50%.
- **Role:** Automations Engineer Intern (Software and AI), Working Entrepreneurs · **Location:** Remote · **Period:** Oct 2025 – Jan 2026
- **Impact:**
  - Used by 50+ clients.
  - Manual review dropped 50%.
  - Accuracy improved by over 60%.
  - The process runs 40% faster.
  - AI chat automations bring in recurring revenue in the thousands of dollars.
- **What I built:** I built AI pipelines that take in documents and data, in TypeScript and Python. I built production ETL workflows that handle hundreds of financial applications a day. I connected AI chat models to automate website interactions.
- **Built with:** TypeScript · Python · ETL · LLM integration

**2 · `control-bh`**
- **Label:** Web · 2024–25 · **Title:** C.O.N.T.R.O.L. BH
- **Summary:** I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%.
- **Role:** Software Engineer (Freelance) · **Location:** Remote · **Period:** Aug 2024 – Dec 2025
- **Impact:**
  - 1,000+ users.
  - Donations rose 40%.
  - Lighthouse score of 98.
  - Shipped in under two weeks, then maintained for a year.
- **What I built:** I built a nonprofit web app with Next.js and TypeScript on Vercel. I integrated Stripe subscriptions, one-time payments, and webhooks, so donations process automatically. I set requirements directly with the executive team.
- **Built with:** Next.js · TypeScript · Stripe · Vercel · HTML5 · CSS3

**3 · `ulti-health`**
- **Label:** AI · Mobile · 2025–26 · **Title:** Ulti-Health
- **Summary:** I built a wellness app that plans workouts and meals from the user's own data.
- **Role:** Personal project · **Location:** Remote · **Period:** Jul 2025 – May 2026
- **What it does:**
  - Recommends workout plans, nutrition plans that avoid the user's allergies, and sleep suggestions from the user's own data.
  - Points mental-health questions to verified resources.
- **What I built:** I built the MVP with Expo and Supabase: sign-in, input validation, a pgvector store for recommendations, and Edge Functions. It includes an on-device journal with encrypted backups, a colour mood pad, and a heatmap of muscles worked. I led architecture, design, and cross-platform implementation.
- **Built with:** Expo · React Native · Supabase · pgvector · Edge Functions · Docker

**4 · `video-interview-plugin`** (new, not featured)
- **Label:** Web · 2024 · **Title:** Video-interview plugin
- **Summary:** I built a video-interview plugin that screened 100+ applicants. Hiring efficiency rose over 50%.
- **Role:** Software Engineer (Freelance), O'Hagan Electrical · **Location:** Aliso Viejo, CA · **Period:** Apr 2024 – Jun 2024
- **Impact:**
  - 100+ applicants screened.
  - Hiring efficiency up over 50%.
  - Hundreds of management hours saved.
- **What I built:** I built a WordPress plugin for video interviews in PHP 8.2 and MySQL. It automated the first screen of applicants.
- **Built with:** WordPress · PHP 8.2 · MySQL · HTML5 · CSS3

**5 · `ai-mind-companion`** (new, not featured)
- **Label:** AI · 2023–24 · **Title:** AI Mind Companion
- **Summary:** I built a voice assistant that flags possible early signs of dementia, using GPT-4 and GPT-3.5.
- **Role:** Personal project · **Location:** Remote · **Period:** Aug 2023 – May 2024
- **What it does:** A voice assistant people talk to. It listens through speech-to-text, replies with text-to-speech, and flags possible early signs of dementia in the conversation.
- **What I built:** I used speech-to-text to capture what the user says and text-to-speech to reply. GPT-4 holds the conversation, and GPT-3.5 classifies it for early signs of dementia, using medical datasets. Data lives in Firestore on Firebase, and an API gateway runs on Google Cloud Run with Cloud Storage.
- **Built with:** GPT-4 · GPT-3.5 · Speech-to-text · Text-to-speech · Firebase · Firestore · Cloud Run · Cloud Storage

### `resume.md` updates (Kyle confirmed)
- **Working Entrepreneurs:** "for over 10 clients" becomes **"for over 50 clients"**.
- **AI Mind Companion:** add the voice-assistant facts. Speech-to-text input, text-to-speech replies, and classification that flags possible early signs of dementia.
- **Home:** the hero proof line becomes "AI pipelines for **50+** clients", and the card summary uses 50+. The facts test maps "50+ clients" to "over 50 clients".

### Detail page layout
```
← All work
AI · 2025–26                                    micro-label
AI document pipelines                           h1
I built AI pipelines for 50+ clients. …         lead (muted)
┌───────────────── media slot 16:9 ─────────────────┐
│   PREVIEW COMING SOON (placeholder, see below)    │
└───────────────────────────────────────────────────┘
Impact / What it does                           h2 + list
What I built                                    h2 + MDX prose
Built with                                      h2 + quiet grey tags (a list)
Role · Location · Period                        muted meta line
```

### The media slot
- **Ships as a placeholder.** A 16:9 bordered box with the site's dim dot grain, a centred mono micro-label "Preview coming soon", and a `{/* TODO(kyle): screenshot or clip */}` comment in the code. It must read as intentional, not broken.
- **For later (not built now):** an optional frontmatter `media` (`{ type: "image" | "video", src, alt, poster? }`) to swap the placeholder for real media.
  - Images use `next/image`.
  - Video is short, muted and looping, with a visible pause button (WCAG 2.2.2). Under reduced motion it shows the poster instead.
  - Real GIFs aren't used (larger files, can't be paused).

### `/work` list
- **Heading:** h1 "Work".
- **Cards:** the five projects in the order above, in the same style as Home: label, title, summary. Each links to `/work/[slug]`. The page keeps its own `<title>` ("Work").
- **Heading levels (builder check, my call):** card titles are **h2** on `/work` (directly under the h1) and **h3** on Home (under "Selected work"). They look identical. The shared card component takes a heading-level prop, which keeps heading order correct (Lighthouse `heading-order`, accessibility 1.0).

### One-item "What it does" (builder check, my call)
- An `impact` list with **one** item renders as a paragraph, not a one-bullet list. The approved copy is unchanged.

## Left to the builder

- The MDX renderer module (for example `src/lib/mdx.tsx`): compile the body at build time and pass a small components map (paragraphs, links using the `link` utility, lists). Test it with unit tests.
- Extracting the shared work card so Home and `/work` use one component.
- The placeholder's exact styling, within the design system. Reuse the grain idea, static, with no animation.
- Per-page metadata: `title` is the project title, and `description` is the summary.
- **Tests:**
  - **Loader:** the new fields and their validation.
  - **Facts:** extend the exact-phrase facts test to cover every number in `impact`, the summaries and the proof line.
  - **MDX:** the renderer.
  - **E2E:** `/work` lists 5 cards in order; each detail page shows its h1, Impact, Built with and placeholder; Home cards link to `/work/[slug]`; unknown slugs return 404; back-link navigation works.
  - **Quality:** axe and Lighthouse on `/work` and every detail page.

## Review focus

1. **Facts:** every number on every detail page maps to an exact resume phrase (the new 50+ especially).
2. **Placeholder:** looks intentional in both themes and at 320 px, and isn't announced confusingly by screen readers (decorative, with a short text label).
3. **MDX safety:** content comes only from the repo. The renderer must not allow raw HTML injection beyond MDX, and must fail the build on MDX syntax errors.
4. **Static build:** all five pages prerendered, unknown slugs 404, and no runtime file reads that break on Vercel.
5. **Live-site change:** Home's proof line and card update to 50+ on merge.
