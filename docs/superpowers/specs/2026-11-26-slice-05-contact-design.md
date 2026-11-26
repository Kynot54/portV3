# Slice 05 — Contact: Design

**Date:** 2026-11-26 · **Owner:** Kyle Whynott · **Spec of record:** `CLAUDE.md`. Builds on the Slice 1–4 designs (`docs/superpowers/specs/`) and `docs/design-tokens.md`. Kyle's account setup: `docs/plans/slice-05-setup.md`.

## Intent

`/contact` gives a hiring manager two ways to reach Kyle, without his email or phone ever appearing on the site:

1. **Send a message.** It lands in Kyle's inbox, ready to reply to.
2. **Book a call.** Cal.com, embedded.

Home's "Get in touch" button and the nav's Contact pill already link here.

## Goals

1. **The page.**
   - h1 "Contact", then the intro: _"I'm looking for my next role as an AI or software engineer. Send a message or book a call. I reply within 2–3 business days."_ (Kyle set the reply time.)
   - Two sections, **Send a message** and **Book a call**: side by side at 768 px and up, stacked below that with the form first.
2. **The message form.**
   - **Fields, in this order:**
     - Name (required)
     - Email (required, valid address)
     - Company (optional)
     - Your role (optional; Kyle: "their position if they would like to disclose it")
     - Message (required)
   - **Server-side limits:** name ≤ 100, email ≤ 254, company ≤ 100, role ≤ 100, message 10–5,000 characters. Every field is trimmed.
   - **Bot protection:** Cloudflare Turnstile, managed mode, so most visitors see no puzzle. Its script loads when the visitor first focuses a form field, not on page load. The token is verified on the server before anything is sent.
   - **Delivery:** Resend's REST API from a Next.js **route handler** (`POST /api/contact`).
     - From: `kwhynott.dev contact <onboarding@resend.dev>` (Resend's test sender, which delivers only to the account's own email, `CONTACT_TO_EMAIL`).
     - Reply-To: the visitor's email.
     - Subject: `Contact: <name> (<company>)`, with the company part dropped if empty.
     - Plain-text body: name, email, company, role, then the message.
   - **States, shown inline:**
     - **Sending:** the button is disabled and reads "Sending…".
     - **Sent:** "Thanks, your message is on its way. I reply within 2–3 business days." The form clears.
     - **Field errors:** next to each field, linked with `aria-describedby`, and focus moves to the first invalid field.
     - **Failure** (Turnstile, Resend or network): "Something went wrong. Try again, or book a call instead."

     Status messages are announced to screen readers (`role="status"` / `role="alert"`).
   - **Not configured:** if any required env var is missing at runtime, the API returns a clear error. The page then shows the failure message, and the server logs exactly which variable is missing (by name, never its value). It never fails silently.
3. **Book a call.**
   - The text "A 30-minute intro call." and a **"Book a call"** button (outline style).
   - Pressing it loads Cal.com's embed (Kyle chose load-on-click): no Cal.com script or cookies before that click.
   - **Once loaded, the calendar spans the full content width, below the form** (Kyle, 2026-11-26). Cal.com's month-and-times view needs about 700 px, which the desktop half column doesn't have. On phones it's already full width. Focus moves to the calendar region (`aria-label="Booking calendar"`), and it scrolls into view. The embed shows `NEXT_PUBLIC_CAL_LINK` (for example `kyle/30min`).
   - While loading, the button reads "Loading calendar…". If the embed fails to load, show a direct link: "Open the booking page" (`https://cal.com/<link>`).
4. **No JavaScript.**
   - The form can't pass Turnstile, so it's replaced by the line "Turn on JavaScript to send a message, or book a call below."
   - "Book a call" becomes a plain link to `https://cal.com/<NEXT_PUBLIC_CAL_LINK>`.
5. **The quality bar from Slices 1–4:**
   - axe zero, in both themes, in every form state
   - Lighthouse 0.99–1.0 on `/contact`, with accessibility 1.0 and **no third-party script before interaction**
   - 44 px targets, visible focus, full keyboard use
   - responsive from 320 px up
   - no console errors

## Non-goals

- **Sending from `@kwhynott.dev`.** It needs DNS records, which are Kyle's call. Optional after launch; only the From address changes.
- Storing messages (no database: V3.1+), auto-replies to the visitor, file attachments, newsletters.
- Our own rate limiting beyond Turnstile and Resend's limits (100 emails a day on the free plan).
- The consulting/services offer (V3.1+, behind `SERVICES_ENABLED`).
- The CSP and security headers (Slice 6). **Recorded for Slice 6:** the CSP must allow `challenges.cloudflare.com` (Turnstile) and Cal.com's embed origins.

## Anti-goals (a failure even if it "works")

- Kyle's email address in the page, the client bundle, or any response.
- A secret (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_TO_EMAIL`) reaching the browser.
- A message lost silently: the visitor sees "sent" but nothing was sent.
- Third-party scripts loading for visitors who never touch the form or the booking button.
- Header injection or HTML injection through form fields (subject and body are plain text; newlines stripped from the subject).
- An accent use beyond "Send message" on this page.

## Constraints

- `CLAUDE.md` and the Slice 1 design: palette, accent rules ("Send message" is this page's main call to action, so it gets the accent), WCAG AA, reduced motion, keyboard, Lighthouse gate.
- **No new dependencies** (Kyle's call is pending; my proposal):
  - Resend through `fetch` to `https://api.resend.com/emails`
  - Turnstile verification through `fetch` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  - Turnstile's widget and Cal.com's embed through their official script URLs, injected on demand
- **Env var names** (exact; Kyle has created them in Vercel):
  - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `TURNSTILE_SECRET_KEY` (server only)
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CAL_LINK` (public)
- **Tests never send real email or call Cloudflare:**
  - The mailer and verifier are injected, so unit tests use fakes.
  - E2E uses Cloudflare's always-pass test site key and a test-only fake-send mode.
  - Previews use real Resend plus the Turnstile test keys (Kyle's setup), which is the end-to-end check.
- Next 16 route handler conventions (`node_modules/next/dist/docs/`). The page stays static. Only `/api/contact` is dynamic.

## Approaches considered

| | Approach | Trade-off | Outcome |
| --- | --- | --- | --- |
| Booking tool | **Cal.com** | Free plan has unlimited meeting types and a customisable embed | **Chosen** (Kyle: "cheapest and gets the job done") |
| | Calendly | Free plan: one meeting type, paid branding | Rejected |
| Booking load | **A. Load on click** | One extra click, about a second to appear; page stays fast, no cookies until asked | **Chosen by Kyle** |
| | B. Load with the page | Instant, but a third-party script on every visit likely fails the Lighthouse gate | Rejected |
| | C. Link out | Simplest, but leaves the site; the brief asks for an embed | No-JS fallback only |
| Form | **Route handler + Turnstile + Resend** | Decided in the brief | **Chosen** |
| Email sender | **Resend test sender** | No DNS; can only send to Kyle's own inbox, which is the only destination | **Chosen**; own domain later |

## Decided details

- **Copy** (Kyle to approve in the PR):
  - "Send a message", "Book a call", "A 30-minute intro call."
  - Labels: "Name", "Email", "Company (optional)", "Your role (optional)", "Message"
  - Buttons and states: "Send message", "Sending…", the sent, failure and no-JS lines above, "Loading calendar…", "Open the booking page"
- **Field errors** (plain): "Enter your name.", "Enter a valid email address.", "Write a message of at least 10 characters.", "Keep this under N characters."
- **Turnstile failure** (token missing or rejected) shows the general failure line. It doesn't mention bots.
- **Responses from `POST /api/contact`:**
  - `200 { ok: true }`
  - `400 { ok: false, errors: { field: message } }` for invalid fields
  - `403` for Turnstile
  - `500` for not configured or Resend failure

  Never echo the input or any env value.
- **Calendar embed:** height and theme follow the site (dark or light) where Cal.com's embed allows. No accent colours injected.

## Calls from the builder check (mine; Kyle can overrule in the PR)

- **Tests never touch Cloudflare or Cal.com.**
  - E2E stubs `challenges.cloudflare.com` and `app.cal.com` / `cal.com` with Playwright route mocks: a stand-in Turnstile script that issues a fake token, and a stand-in Cal.com script.
  - In e2e fake-send mode, `/api/contact` skips both Turnstile verification and Resend. That mode is ignored in production.
  - The embed-failure fallback is tested by making the Cal.com stub fail.
  - CI never depends on third-party uptime.
- **axe and Lighthouse cover our page, not third-party iframes.**
  - axe runs every form state with the Turnstile and Cal.com iframes excluded (we can't fix their content), and the exclusion is recorded in the test.
  - Lighthouse scores the page as loaded, before any click.
- **Missing public values.**
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `NEXT_PUBLIC_CAL_LINK` are baked into the page when it's built.
    - **Production build** (`VERCEL_ENV === "production"`) **fails** if either is missing. A broken contact page never ships.
    - **Previews, local, CI:** the form shows the "not configured" failure line, and the booking section hides its button and link instead of linking to `cal.com/undefined`.
  - CI's e2e and Lighthouse builds set harmless test values (Cloudflare's test site key, a placeholder Cal link that the stubs serve).
- **Turnstile size.** Appearance **"interaction-only"**: the widget stays invisible and takes no space unless Cloudflare actually needs the visitor to click. Size **"flexible"**, placed above "Send message". This avoids layout shift and the 320 px overflow in the normal case.

## Left to the builder

- Component split, the form's state handling (a client component posting JSON with `fetch`), and spacing within the existing tokens.
- How the fake-send mode is switched on for e2e (an env flag read only by the route handler, ignored when `VERCEL_ENV === "production"`, as with `BLOG_SAMPLES`).
- The exact Cal.com embed snippet (current official inline embed) and how to detect a load failure (timeout).
