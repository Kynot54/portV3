# Slice 05: Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/contact` placeholder with a Turnstile-protected message form that emails Kyle through Resend, plus a Cal.com calendar that loads only on click.

**Architecture:**

- **Server logic** lives in small injected-dependency modules under `src/lib/contact/`:
  - validate
  - build email
  - verify Turnstile
  - send through Resend
  - config check
  - handler

  A thin route handler (`POST /api/contact`) wires them to `fetch` and `process.env`.

- **The page stays static.** Two client components (form, booking) load the third-party scripts on demand.
- **E2E** stubs both third-party scripts with Playwright route mocks and runs the API in a fake-send mode that never reaches the network.

**Tech Stack:** The Slice 1–4 stack (Next 16.4.6 route handlers, React 19.3, Tailwind 4, shadcn `Button`), Vitest, Playwright + axe, LHCI. **No new packages:** Resend and Turnstile go through `fetch`.

**Spec:** `docs/superpowers/specs/2026-11-26-slice-05-contact-design.md` (approved 2026-11-26).

## Approach, alternatives, risks

- **Approach:** validation and email → Turnstile and Resend clients → handler and route → form → booking → page, config guard and no-JS → quality pass and PR.
- **Alternatives:** listed in the spec's Approaches table (Cal.com on click, the route handler, the Resend test sender).
- **Risks:**
  - **Third-party script APIs drift.** The stubs only mimic the surface we call (`turnstile.render/reset`, `Cal(...)`). The preview test with real keys is the real check.
  - **Resend's test sender delivers only to the account email.** If `CONTACT_TO_EMAIL` differs from it, Resend returns an error, and the visitor sees the failure line. The PR tells Kyle.
  - **Merging deploys to production,** and with the real keys it sends real email.

## Global Constraints

- **Env names (exact):**
  - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `TURNSTILE_SECRET_KEY` (server only)
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CAL_LINK` (public)
  - Test-only: `CONTACT_FAKE_SEND=1`, ignored when `VERCEL_ENV === "production"`.
- **Fields and limits** (trimmed):
  - `name` required, ≤ 100
  - `email` required, valid, ≤ 254
  - `company` optional, ≤ 100
  - `role` optional, ≤ 100
  - `message` required, 10–5,000
- **Email:**
  - From: `kwhynott.dev contact <onboarding@resend.dev>`
  - To: `CONTACT_TO_EMAIL`
  - Reply-To: the visitor's email
  - Subject: `Contact: <name> (<company>)`, or `Contact: <name>` with no company; CR/LF stripped
  - Plain-text body, in order: `Name:`, `Email:`, `Company:`, `Role:`, a blank line, then the message (empty optional lines omitted)
- **API responses:**
  - `200 {ok:true}`
  - `400 {ok:false, errors:{field:msg}}`
  - `403 {ok:false}` (Turnstile)
  - `500 {ok:false}` (not configured, or Resend failed)

  Never echo the input or env values. Log missing env **names** only.

- **Copy (exact):**
  - h1 "Contact"
  - Intro: "I'm looking for my next role as an AI or software engineer. Send a message or book a call. I reply within 2–3 business days."
  - Sections "Send a message" and "Book a call"
  - Labels: "Name", "Email", "Company (optional)", "Your role (optional)", "Message"
  - Buttons: "Send message", "Sending…"
  - Sent: "Thanks, your message is on its way. I reply within 2–3 business days."
  - Failure: "Something went wrong. Try again, or book a call instead."
  - Errors: "Enter your name.", "Enter a valid email address.", "Write a message of at least 10 characters.", "Keep this under N characters."
  - Booking: "A 30-minute intro call.", "Book a call", "Loading calendar…", "Open the booking page"
  - No-JS: "Turn on JavaScript to send a message, or book a call below."
- **Accent:** "Send message" uses `Button` variant `default` (the accent). "Book a call" uses `outline`. No other accent.
- **Layout:**
  - Form and booking side by side from 768 px (`md:`), stacked below that with the form first.
  - The loaded calendar spans the full content width below both, with `role="region"` and `aria-label="Booking calendar"`; it scrolls into view and takes focus.
- **Third-party loading:**
  - **Turnstile:** `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`, loaded on the first `focusin` inside the form. Render options `{ sitekey, appearance: "interaction-only", size: "flexible", callback, "expired-callback", "error-callback" }`.
  - **Cal.com:** `https://app.cal.com/embed/embed.js`, loaded on the "Book a call" click.
  - Neither loads before interaction.
- **Production build guard:** `next.config.ts` throws if `VERCEL_ENV === "production"` and either public var is missing.
- **Slice 1–4 rules:**
  - Tokens, the focus ring, 44 px targets.
  - No horizontal scroll from 320 px up.
  - axe zero in both themes, with third-party iframes excluded.
  - Lighthouse: accessibility 1.0, others ≥ 0.95, target 0.99, scored before interaction.
  - No console errors.
  - Run npm with `npm_config_cache=$TMPDIR/npm-cache`. Run build, e2e, LHCI and git writes outside the sandbox. Scan for `* 2*` copies before each task.

## Review Focus

1. **CR/LF or header text in name or company** (`"Bob\r\nBcc: x@y.z"`) must never reach the subject line as a header. → Task 1 `subject strips CR/LF`.
2. **A malformed email used as reply-to** (`"a@b.c\r\nBcc: z@z.z"`, `"a@b"`, 255 characters) must be rejected before sending. → Task 1 `rejects header-injection and overlong emails`.
3. **A non-JSON, empty or oversized body** posted to `/api/contact` gets a 400, not a crash or a 500. → Task 3 `bad bodies are 400`.
4. **A double-click on "Send message"** sends one request, not two. → Task 4 `a second click while sending is ignored`.
5. **After a failed send, the Turnstile token is spent.** The form must reset the widget so a retry gets a fresh token, not a guaranteed 403. → Task 4 `failure resets Turnstile`.

---

## File structure

```
src/lib/contact/validate.ts     validateContact(), types, LIMITS, messages
src/lib/contact/email.ts        buildEmail()
src/lib/contact/turnstile.ts    verifyTurnstile()
src/lib/contact/resend.ts       sendEmail()
src/lib/contact/config.ts       missingServerEnv(), isFakeSend()
src/lib/contact/handler.ts      handleContact()
src/app/api/contact/route.ts    POST → handleContact with real deps
src/lib/load-script.ts          loadScript(src) (once per src)
src/components/contact/contact-form.tsx   client form + Turnstile
src/components/contact/booking.tsx        client Cal.com on click
src/app/contact/page.tsx        page, layout, no-JS fallbacks
next.config.ts                  production guard for public vars
playwright.config.ts, lighthouserc.json   test env values
tests/unit/contact-{validate,email,clients,handler}.test.ts
tests/unit/contact-form.test.tsx, booking.test.tsx, next-config.test.ts
tests/e2e/contact.spec.ts (+ third-party stubs in tests/e2e/stubs/)
```

---

### Task 1: Validation and email

**Files:**

- Create: `src/lib/contact/validate.ts`, `src/lib/contact/email.ts`
- Test: `tests/unit/contact-validate.test.ts`, `tests/unit/contact-email.test.ts`

**Interfaces:**

- Produces:
  - `type ContactField = "name" | "email" | "company" | "role" | "message"`
  - `type ContactInput = { name: string; email: string; company: string; role: string; message: string }`
  - `LIMITS: Record<ContactField, { min?: number; max: number }>`
  - `validateContact(raw: unknown): { ok: true; data: ContactInput } | { ok: false; errors: Partial<Record<ContactField, string>> }`. Trims every field. A non-object becomes all-required errors.
  - `buildEmail(data: ContactInput, to: string): { from: string; to: string; reply_to: string; subject: string; text: string }`

- [ ] **Step 1: Write the failing tests.**
  - **Validate:**
    - `accepts a minimal valid message`
    - `trims every field`
    - `required errors use the exact copy`: name → "Enter your name.", email → "Enter a valid email address.", message (9 characters) → "Write a message of at least 10 characters."
    - `max lengths`: 101-character name → "Keep this under 100 characters."; 5,001-character message → "Keep this under 5000 characters."
    - `optional company and role may be empty`
    - **`rejects header-injection and overlong emails`:** `"a@b.c\r\nBcc: z@z.z"`, `"a@b"`, `"x@y"`, and a 255-character address all fail on `email`
    - `non-object input → errors for name, email, message`
  - **Email:**
    - `from, to, reply_to are exact`
    - `subject with and without company`
    - **`subject strips CR/LF`:** name `"Bob\r\nBcc: x@y.z"` → the subject contains no `\r` or `\n`
    - `text lists fields in order and omits empty optionals`
- [ ] **Step 2: Run** `npx vitest run tests/unit/contact-validate.test.ts tests/unit/contact-email.test.ts`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement both modules.**
  - **Email check:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, plus the 254 maximum. No `\s` is allowed anywhere, which blocks CR/LF.
  - **Subject:** replace `[\r\n]+` with a space.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(contact): validation and email builder`.

---

### Task 2: Turnstile verify, Resend send, config

**Files:**

- Create: `src/lib/contact/turnstile.ts`, `resend.ts`, `config.ts`
- Test: `tests/unit/contact-clients.test.ts`

**Interfaces:**

- Produces:
  - `verifyTurnstile(token: string, secret: string, ip: string | null, fetchImpl?: typeof fetch): Promise<boolean>`. It POSTs form data `secret`, `response` and optionally `remoteip` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Returns `json.success === true`. A network error or non-200 gives `false`. An empty token gives `false` without fetching.
  - `sendEmail(email: ReturnType<typeof buildEmail>, apiKey: string, fetchImpl?: typeof fetch): Promise<{ ok: true; id: string } | { ok: false }>`. It POSTs JSON to `https://api.resend.com/emails` with `Authorization: Bearer <key>`. Success is `res.ok && json.id`. It never throws.
  - `missingServerEnv(env: Record<string, string | undefined>): string[]`. Returns the names among `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `TURNSTILE_SECRET_KEY` that are missing or blank.
  - `isFakeSend(env): boolean`. `CONTACT_FAKE_SEND === "1" && VERCEL_ENV !== "production"`.

- [ ] **Step 1: Write the failing tests** with a fake `fetchImpl` (`vi.fn`):
  - `verifyTurnstile posts secret, response, remoteip to siteverify`
  - `verifyTurnstile is false on success:false, non-200, throw, empty token (no fetch)`
  - `sendEmail sends bearer auth and the JSON body`
  - `sendEmail → ok:false on 4xx/5xx or throw`
  - `missingServerEnv names exactly the missing/blank vars`
  - `isFakeSend is ignored in production`
- [ ] **Step 2: Run** `npx vitest run tests/unit/contact-clients.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the three modules.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(contact): Turnstile verify, Resend send, config check`.

---

### Task 3: Handler and route

**Files:**

- Create: `src/lib/contact/handler.ts`, `src/app/api/contact/route.ts`
- Test: `tests/unit/contact-handler.test.ts`

**Interfaces:**

- Consumes: Tasks 1–2.
- Produces: `handleContact(request: Request, deps: { env: Record<string, string | undefined>; verify: typeof verifyTurnstile; send: typeof sendEmail; log?: (msg: string) => void }): Promise<Response>`.
  - **Order:**
    1. Content-Length over 20,000, or JSON parse failure → `400 {ok:false, errors:{}}`
    2. `validateContact(body)` fails → 400 with errors
    3. `isFakeSend(env)` → `200 {ok:true}`, with no verify or send
    4. `missingServerEnv` is not empty → log `contact: missing env <NAMES>` and return 500
    5. `verify(body.token, …, ip from x-forwarded-for first entry)` is false → 403
    6. `send(buildEmail(data, env.CONTACT_TO_EMAIL), env.RESEND_API_KEY)` fails → log `contact: resend failed` and return 500
    7. Otherwise → 200
  - `route.ts` exports `POST(request)`, which calls `handleContact` with `process.env` and the real functions.

- [ ] **Step 1: Write the failing tests** with fake deps:
  - `valid + verified + sent → 200 {ok:true}`
  - `invalid fields → 400 with the field errors`
  - **`bad bodies are 400`:** `"not json"`, `""`, and a body with Content-Length 20,001
  - `fake-send mode skips verify and send`
  - `missing env → 500, logs names only (no values), never calls verify/send`
  - `turnstile false → 403, send not called`
  - `resend failure → 500`
  - `responses never contain the input or env values`: serialise every response body; it contains neither the test email nor `re_test_key`
- [ ] **Step 2: Run** `npx vitest run tests/unit/contact-handler.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the handler and route.
- [ ] **Step 4: Run** the same command, then `npm test` and `npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(contact): POST /api/contact`.

---

### Task 4: The message form

**Files:**

- Create: `src/lib/load-script.ts`, `src/components/contact/contact-form.tsx`
- Test: `tests/unit/contact-form.test.tsx`

**Interfaces:**

- Consumes: `validateContact`, `LIMITS`, `ContactField` (Task 1).
- Produces:
  - `loadScript(src: string): Promise<void>`. It appends one `<script async>` per `src`, reuses the pending promise, and rejects on `error`.
  - `ContactForm({ siteKey }: { siteKey: string | undefined })`, a client component.
- **Behaviour:**
  - **The form:** `noValidate`, labelled inputs (`name`, `email`, `company`, `role`, `message` textarea), and the submit "Send message" (accent).
  - **Turnstile:** on the first `focusin`, load Turnstile and `turnstile.render` into a div above the button, keeping the token in a ref.
  - **On submit:**
    - Validate on the client first. Show errors next to each field (`aria-invalid`, `aria-describedby`), and focus the first invalid field.
    - Otherwise POST JSON `{...fields, token}` to `/api/contact`. While sending, the button is disabled and reads "Sending…".
  - **Results:**
    - **200:** clear the fields and show the sent line in `role="status"`.
    - **400:** show the server errors.
    - **Anything else, or a network error:** show the failure line in `role="alert"` and call `turnstile.reset(widgetId)`.
  - **No `siteKey`:** on submit, show the failure line; no Turnstile load and no POST.

- [ ] **Step 1: Write the failing tests** (jsdom; stub `window.turnstile`, `fetch` mocked, `loadScript` mocked with `vi.mock`):
  - `labels and fields render with the exact copy`
  - `invalid submit shows exact errors and focuses the first invalid field; no fetch`
  - `Turnstile loads on first focus, not on render`
  - `valid submit posts fields + token and shows the sent line; fields clear`
  - **`a second click while sending is ignored`** (one fetch)
  - **`failure resets Turnstile`** (a 500 response → alert line and `turnstile.reset` called)
  - `server 400 errors are shown per field`
  - `missing siteKey → failure line, no fetch`
- [ ] **Step 2: Run** `npx vitest run tests/unit/contact-form.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** `loadScript` and `ContactForm`.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(contact): message form with on-demand Turnstile`.

---

### Task 5: Booking on click

**Files:**

- Create: `src/components/contact/booking.tsx`
- Test: `tests/unit/booking.test.tsx`

**Interfaces:**

- Consumes: `loadScript` (Task 4).
- Produces: `Booking({ calLink }: { calLink: string | undefined })`, a client component. With no `calLink` it renders the intro line only: no button, no link.
- **Behaviour:**
  - "A 30-minute intro call." plus a "Book a call" `outline` button.
  - **On click:**
    1. The label becomes "Loading calendar…".
    2. Run Cal.com's official inline-embed bootstrap, then `loadScript("https://app.cal.com/embed/embed.js")`.
    3. `Cal("init", { origin: "https://cal.com" })`
    4. `Cal("inline", { elementOrSelector: <region>, calLink, layout: "month_view" })`
    5. `Cal("ui", { theme: resolvedTheme })`
  - **The region** (`role="region"`, `aria-label="Booking calendar"`, `tabIndex={-1}`) renders as a full-width sibling **after** the two-column grid (via a portal target id `booking-calendar`, provided by the page). It scrolls into view and takes focus.
  - **On script error, or no Cal iframe within 10 s:** show the link "Open the booking page" → `https://cal.com/<calLink>` (`rel="noopener"`, new tab).

- [ ] **Step 1: Write the failing tests:**
  - `no script before click`
  - `click loads embed.js and calls Cal init/inline with the link`
  - `the calendar region is focused and labelled`
  - `script error → "Open the booking page" with the right href`
  - `no calLink → no button, no link`
- [ ] **Step 2: Run** `npx vitest run tests/unit/booking.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** `Booking`.
- [ ] **Step 4: Run** the same command, then `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(contact): Cal.com booking loads on click`.

---

### Task 6: Page, no-JS, production guard, e2e

**Files:**

- Modify: `src/app/contact/page.tsx`, `next.config.ts`, `playwright.config.ts`, `lighthouserc.json`
- Create: `tests/e2e/contact.spec.ts`, `tests/e2e/stubs/turnstile.js`, `tests/e2e/stubs/cal.js`, `tests/unit/next-config.test.ts`

**Interfaces:**

- Consumes: `ContactForm`, `Booking`.
- Produces:
  - **The page:**
    - h1 and intro
    - grid `md:grid-cols-2`:
      - the "Send a message" section, with `ContactForm` wrapped in `.js-only`, plus a `<noscript>` holding the no-JS line
      - the "Book a call" section, with `Booking` in `.js-only`, plus a `<noscript>` link "Book a call" → `https://cal.com/<link>`, shown only if a link is set
    - then `<div id="booking-calendar">`
  - **`assertPublicEnv(env): void`,** exported from `src/lib/contact/config.ts`. It throws naming the missing var when `VERCEL_ENV === "production"`. `next.config.ts` calls it.
  - **Playwright `webServer.env`:**
    - `NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA"`
    - `NEXT_PUBLIC_CAL_LINK: "test/30min"`
    - `CONTACT_FAKE_SEND: "1"`
  - **The LHCI start command** uses the same three.

- [ ] **Step 1: Write the failing tests.**
  - **Unit:**
    - `assertPublicEnv throws in production when a public var is missing`
    - `assertPublicEnv passes outside production`
  - **E2E** (`page.route` serves the stubs for `challenges.cloudflare.com/**` and `app.cal.com/**`; `cal.com/**` is aborted):
    - `no third-party request before interaction` (record requests on load; none to cloudflare or cal)
    - `send a message end to end`: focus Name → the Turnstile stub loads. Fill valid fields, submit → the sent line shows.
    - `field errors are announced and focused`
    - `failure line on a 500` (`page.route("/api/contact", 500)`)
    - `Book a call loads the calendar full width and focuses it`: the region's width is ≥ the grid's width minus 1 px at 1440.
    - `embed failure shows Open the booking page` (the Cal stub route aborts)
    - `no-JS: form hidden, no-JS line and Cal link shown`
    - `320px: no horizontal scroll`
    - `only one accent button on the page`: count elements with class `accent-glow` inside `main` = 1
- [ ] **Step 2: Run** `npx vitest run tests/unit/next-config.test.ts`, then `npm run test:e2e -- tests/e2e/contact.spec.ts --project=desktop`. Expected: FAIL.
- [ ] **Step 3: Implement** the page, the guard, the configs and the stubs.
  - **Turnstile stub:** `window.turnstile = { render(el, o) { setTimeout(() => o.callback("stub-token")); return "w1"; }, reset() {} }`
  - **Cal stub:** defines `window.Cal` and on `"inline"` appends an `<iframe title="Cal stub">` to the target.
- [ ] **Step 4: Run** `npm test`, then `npm run test:e2e` (full). Expected: all PASS.
- [ ] **Step 5: Commit** `feat(contact): /contact page, no-JS fallback, production env guard`.

---

### Task 7: Quality pass, PR

**Files:**

- Modify: `tests/e2e/a11y.spec.ts`
- Create: `docs/plans/slice-05-pr.md`, `docs/plans/slice-05-screens/*.png`
- Modify: `docs/plans/CHECKPOINT.md`

- [ ] **Step 1: Extend a11y.** Add `axe: contact form states in {dark,light}`, with the stubs routed: the error state, the sent state, and the calendar open. The scan uses `.exclude("iframe")`, commented "third-party content we can't fix".
- [ ] **Step 2: Run** the full `npm run test:e2e`, then `npm run lhci`. Expected: all pass, and `/contact` meets the gate.
- [ ] **Step 3: Run** `npm run lint && npm run format:check && npm run typecheck && npm test`. Do a keyboard pass (via e2e and manual notes) and take screenshots: desktop, phone, dark and light, error, sent, calendar open, no-JS.
- [ ] **Step 4: Write `slice-05-pr.md`.**
  - **Summary.** Preview: it uses real Resend and the Turnstile test keys, and **Kyle tests by sending himself a message**.
  - **Needs Kyle's call:**
    - the copy
    - a custom domain sender later
    - the official `resend` package (declined)
  - **Conflicts:** none expected.
  - **Slice 6 notes:** CSP origins `challenges.cloudflare.com`, `app.cal.com` and `cal.com`.
  - **Merge = production; real emails.**
- [ ] **Step 5: Commit, push and open the PR.** Update the checkpoint.
