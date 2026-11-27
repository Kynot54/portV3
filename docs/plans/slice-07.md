# Slice 7: Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/services`, Kyle's consulting page for non-technical founders: offers, training, evidence and how it works. It has its own Cal.com consultation booking and the contact form, which tags its messages as Services.

**Architecture:** It reuses the Contact pieces:

- `Booking` gains label props.
- `ContactForm` and `/api/contact` gain a `source` that only changes the email subject.

The page's copy lives in one typed module, so the facts test can check it. Everything stays behind `isServicesEnabled()`: the route, its card, its sitemap entry and the three links. A production build with Services on fails without `NEXT_PUBLIC_CAL_CONSULT_LINK`.

**Tech Stack:** Next.js 16 (App Router, Cache Components), React 19, Tailwind 4, Vitest + Testing Library, Playwright + axe, LHCI.

**Spec:** `docs/superpowers/specs/2026-11-26-slice-07-services-design.md` (approved by Kyle, 2026-11-27).

## Global Constraints

- **Copy:** exactly the approved copy in the spec, section "Page copy", with Kyle's answers applied. Step 4's wording ("Hand-off and upkeep…") is listed under "Needs Kyle's call" in the PR.
- **Facts:** every quantity on the page maps to an exact `content/source/resume.md` phrase through `CLAIMS` in `tests/unit/content.test.ts`.
- **Flag:** Services exists only when `SERVICES_ENABLED === "true"` (`isServicesEnabled`). When off, there's no route (404), no card, no sitemap entry and no links.
- **Placement B:** never in the header nav.
- **Dependencies:** none new. CSP unchanged (Cal.com's origins are already allowed, and no build allows eval).
- **Quality bar:** axe 0; Lighthouse accessibility 1.0, every other category ≥ 0.95; no console errors; mobile, tablet and desktop.
- **Env vars are Production-only.** Check the real embeds locally (README), never on a preview.
- **Description:** 100–160 characters.

## Review Focus

1. **Services on, consult link unset** (a local build, or a preview with the flag): the page renders, with no booking button and no error. Pinned in Task 2.
2. **A forged or unknown `source` in the POST body:** the email is treated as "contact", and nothing from `source` reaches a header. Pinned in Task 1.
3. **Flag off after it was on:** `/services`, its card, the sitemap entry and all three links disappear together. Pinned in Tasks 3–5.
4. **The Contact page after this change:** it still books the 30-minute intro on `NEXT_PUBLIC_CAL_LINK` and still sends "Contact:" emails. Covered by the existing contact e2e and the unit tests in Task 1.
5. **Two booking areas can't collide:** Services renders its calendar into its own `#booking-calendar`. Pinned in Task 6's e2e.

---

### Task 1: Contact `source` (email subject only)

**Files:**

- Modify: `src/lib/contact/validate.ts`, `src/lib/contact/email.ts`, `src/lib/contact/handler.ts`, `src/components/contact/contact-form.tsx`
- Test: `tests/unit/contact-validate.test.ts`, `tests/unit/contact-email.test.ts`, `tests/unit/contact-handler.test.ts`, `tests/unit/contact-form.test.tsx`

**Interfaces:**

- Produces:
  - `type ContactSource = "contact" | "services"`
  - `parseSource(raw: unknown): ContactSource`, in `validate.ts`
  - `buildEmail(data, to, source: ContactSource = "contact")`
  - a `ContactForm` prop `source?: ContactSource` (default `"contact"`), sent as `source` in the JSON body

- [ ] **Step 1: Write the failing tests**
  - `parseSource({ source: "services" })` → `"services"`. Every other input gives `"contact"`: `{}`, `{ source: "Services" }`, `{ source: "services\r\nBcc: x" }`, `null`, `{ source: 1 }`.
  - `buildEmail(data, to, "services").subject` → `"Services: Ada (Acme)"`. The default stays `"Contact: Ada (Acme)"`.
  - Handler: a valid body with `source: "services"` calls `send` with a subject starting `"Services: "`. With `source: "x"`, it starts `"Contact: "`.
  - Form: rendered with `source="services"`, the fetch body's `source` is `"services"`. Rendered with no prop, it's `"contact"`.
- [ ] **Step 2:** `npx vitest run tests/unit/contact-*.test.ts*`. Expected: the new tests fail.
- [ ] **Step 3: Implement.** `source` stays out of `FIELDS` and `ContactInput`, so length limits and validation errors are unchanged. The handler calls `parseSource(body)` after validation.
- [ ] **Step 4:** run the same tests, then `npm test`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(contact): source tag, so Services messages arrive as "Services: …"`

### Task 2: `Booking` labels

**Files:**

- Modify: `src/components/contact/booking.tsx`
- Test: `tests/unit/booking.test.tsx`

**Interfaces:**

- Produces: `Booking({ calLink, intro = "A 30-minute intro call.", label = "Book a call", timeoutMs })`. Services passes:
  - `intro="A free 30-minute consultation."`
  - `label="Book a consultation"`

- [ ] **Step 1: Write the failing tests**
  - With `intro` and `label`, the text and button show them.
  - Without them, it still shows "A 30-minute intro call." and "Book a call".
  - With `calLink={undefined}` and the Services labels, it renders the intro, no button and no error (Review Focus 1).
- [ ] **Step 2:** `npx vitest run tests/unit/booking.test.tsx`. Expected: the new tests fail.
- [ ] **Step 3: Implement.** The fallback link text stays "Open the booking page".
- [ ] **Step 4:** run the tests. Expected: they pass.
- [ ] **Step 5:** commit: `feat(booking): intro and button labels`

### Task 3: Env, flag wiring and the test servers

**Files:**

- Modify: `src/lib/contact/config.ts`, `.env.development`, `playwright.config.ts`, `lighthouserc.json`, `README.md`
- Test: `tests/unit/next-config.test.ts`, or the existing config test that covers `assertPublicEnv`

**Interfaces:**

- Produces: `assertPublicEnv(env)` also requires `NEXT_PUBLIC_CAL_CONSULT_LINK`, but only when `VERCEL_ENV === "production"` and `isServicesEnabled(env)`. The error names the variable.

- [ ] **Step 1: Write the failing tests**
  - Production, Services on, no consult link: throws, and the message includes `NEXT_PUBLIC_CAL_CONSULT_LINK`.
  - Production, Services off, no consult link: doesn't throw.
  - Preview, Services on: doesn't throw.
- [ ] **Step 2:** run them. Expected: the first fails.
- [ ] **Step 3: Implement.** Also update the test servers and dev settings:
  - **`.env.development`:** add `SERVICES_ENABLED=true` and `NEXT_PUBLIC_CAL_CONSULT_LINK=rick/get-rick-rolled`.
  - **Playwright `webServer.env`:** add `SERVICES_ENABLED: "true"` and `NEXT_PUBLIC_CAL_CONSULT_LINK: "test/consultation"`.
  - **LHCI:** add the same two variables to both commands, and `http://localhost:3200/services` to `url`.
  - **README:** add the variable to the env notes, and the consultation booking to the real-embed check.
- [ ] **Step 4:** `npm test`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(services): require the consultation link when Services is on in production`

### Task 4: The page, its copy, tags and card

**Files:**

- Create:
  - `src/lib/services-copy.ts`: every string on the page, typed, exactly as in the spec
  - `src/components/services/*`: the sections
  - `src/app/services/opengraph-image.tsx`
- Modify:
  - `src/app/services/page.tsx`
  - `src/lib/seo.ts` (`PAGE_DESCRIPTIONS.services`)
  - `docs/plans/services.md`: replace the TODO with a pointer to `src/lib/services-copy.ts`
- Test: `tests/unit/services.test.tsx` (new), `tests/unit/content.test.ts`, `tests/unit/seo.test.ts`

**Interfaces:**

- Consumes:
  - `Booking` with labels (Task 2)
  - `ContactForm source="services"` (Task 1)
  - `pageMetadata`, `cardAlt` and `renderCard`
- Produces:
  - `SERVICES_COPY`, a typed object with `hero`, `offers[3]`, `training`, `evidence[3]` (each has `slug`, `title` and `text`), `steps[4]`, `contact` and `linkLine`
  - `generateMetadata()`, returning `pageMetadata({ title: "Services", description: PAGE_DESCRIPTIONS.services, path: "/services" })` when the flag is on, and `{}` when off

- [ ] **Step 1: Write the failing tests**
  - **Description:** `PAGE_DESCRIPTIONS.services` is exactly "I build websites and custom software for founders and small businesses, and I teach teams to use technology and AI. It starts with a free call." (143 characters).
  - **Facts:** every string in `SERVICES_COPY` goes into the copy the facts test checks. Add `CLAIMS` entries mapping:
    - "two sections of 40+ students each" → "two sections of 40+ undergraduate students each"
    - "60+ students" → "for 60+ undergraduate students"
    - "50+ clients" → "over 50 clients"
    - "manual review by 50%" → "cutting manual review down by 50%"
    - "100+ applicants" and "over 35%" → the O'Hagan phrases
    - the C.O.N.T.R.O.L. BH figures → the existing phrases ("under 2 weeks", "maintenance for a year", "1,000+ users", "by 40%")
  - **Exempt offers, not claims:** add `30-minute` and `2–3 business days` to `EXEMPT`.
  - **Render, flag on:**
    - one h1, "Software for your business, built around how it works."
    - three offer headings
    - three evidence links, to `/work/control-bh`, `/work/video-interview-plugin` and `/work/ai-document-pipelines`
    - four steps
    - a "Book a consultation" button
    - a form whose submit sends `source: "services"`
  - **Flag off:**
    - The page calls `notFound()` (mock `next/navigation`).
    - `generateMetadata()` returns no `alternates`.
- [ ] **Step 2:** `npx vitest run tests/unit/services.test.tsx tests/unit/content.test.ts tests/unit/seo.test.ts`. Expected: the new tests fail.
- [ ] **Step 3: Implement.**
  - **Layout:** the same shell as Contact (`max-w-5xl px-gutter py-section`), the micro-label style for `SERVICES`, and the Work card style for the evidence.
  - **Contact block:** the form and the booking side by side, as on Contact, with its own `#booking-calendar` below.
  - **Hero buttons:**
    - "Book a consultation" scrolls to the contact block and focuses its booking button.
    - "Send a message" links to `#message`.
    - Without JS, both are plain anchor links.
  - **Card:** `alt = cardAlt("Services")`. It calls `notFound()` when the flag is off.
- [ ] **Step 4:** `npm test && npm run lint && npm run typecheck`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(services): the Services page, copy, tags and card`

### Task 5: Links, only while on

**Files:**

- Modify: `src/components/footer.tsx`, `src/components/home/contact-cta.tsx`, `src/app/contact/page.tsx`
- Test: `tests/unit/home.test.tsx`, plus a new `tests/unit/footer.test.tsx`

**Interfaces:**

- Consumes: `isServicesEnabled()` and `SERVICES_COPY.linkLine` ("Run a business and need software built? See what I offer.", where "See what I offer" links to `/services`).

- [ ] **Step 1: Write the failing tests**
  - With `SERVICES_ENABLED=true`:
    - the footer has a "Services" link to `/services`
    - `ContactCta` shows the link line, linking to `/services`
  - With it unset: neither appears.
  - The header nav never has Services (existing header test, plus one assertion).
- [ ] **Step 2:** run them. Expected: they fail.
- [ ] **Step 3: Implement.**
  - The components read the flag on the server.
  - The Contact page gets the same link line under its intro.
- [ ] **Step 4:** `npm test`. Expected: all pass.
- [ ] **Step 5:** commit: `feat(services): link from Home, Contact and the footer while on`

### Task 6: E2E, sitemap, Lighthouse

**Files:**

- Create: `tests/e2e/services.spec.ts`
- Modify:
  - `tests/e2e/fixtures.ts`: add `"/services"` to `ROUTES`, so the 200/one-h1 and axe checks cover it
  - `tests/e2e/shell.spec.ts`: remove the two off-state `/services` 404 tests. Task 4's unit tests own the off state.
  - `tests/e2e/seo.spec.ts`: `expectedListed` gains `"/services"`, and drop `not.toContain("/services")`

- [ ] **Step 1: Write the failing e2e tests** (stub Cal.com as `contact.spec.ts` does):
  - **Booking:** "Book a consultation" loads the calendar for `test/consultation` into the Services `#booking-calendar`. Contact still loads `test/30min` (Review Focus 5).
  - **Form:** submitting sends `source: "services"` to `/api/contact` (intercept the request) and shows the success state.
  - **Hero buttons:** "Book a consultation" moves focus to the booking button; "Send a message" moves to the form.
  - **Links:** the Home link line, the Contact link line and the footer link reach `/services`, and the header nav has no Services.
  - **Evidence:** the three cards open their Work pages.
  - **No "Refused to…" console errors** (the fixture already fails on them).
- [ ] **Step 2:** `npm run test:e2e`. Expected: the new tests fail; the rest pass.
- [ ] **Step 3: Fix what fails** (the page code from Tasks 4–5).
- [ ] **Step 4:** run `npm run test:e2e` and `npm run lhci`. Expected: everything passes, and `/services` scores 100 in accessibility and ≥ 0.95 elsewhere.
- [ ] **Step 5:** commit: `test(services): e2e, sitemap and Lighthouse cover /services`

### Task 7: Real-embed check, docs, PR

- [ ] **Real-embed check:** run a local `next build` and `next start` with:
  - `SERVICES_ENABLED=true`
  - Turnstile's test key
  - `NEXT_PUBLIC_CAL_LINK=rick/get-rick-rolled`
  - `NEXT_PUBLIC_CAL_CONSULT_LINK=rick/get-rick-rolled`

  Export each variable separately (zsh). Then, in Chromium, Firefox and WebKit, on `/services` and `/contact`: press the booking button, focus the form and switch the theme. Expected: no CSP violations.

- [ ] **Docs:** update `docs/plans/CHECKPOINT.md`. Then write the PR body to `docs/plans/slice-07-pr.md`, with:
  - the deploy warning
  - a summary
  - screenshots at mobile and desktop, light and dark
  - the test evidence
  - **Needs Kyle's call:** step 4's wording, and the layout
  - **Live checklist:** book a test consultation, send a test Services message, and check that the subject starts "Services:"
- [ ] **Final review:** a whole-branch review (executing-plans), then the PR. Kyle merges.
