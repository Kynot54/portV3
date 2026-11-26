## ⚠️ Merging deploys to production, and sends real email

`kwhynott.dev` serves `main`. After merging, `/contact` takes real messages: they go through Cloudflare Turnstile and Resend to `CONTACT_TO_EMAIL`. The live build **fails on purpose** if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` or `NEXT_PUBLIC_CAL_LINK` is missing from the `portfolio` project's Production settings, so a broken contact page can't ship.

## Before merging: test it on the preview

The preview uses your real Resend key and Cloudflare's always-pass Turnstile test keys (your setup). So:

1. Open the preview's `/contact` and **send yourself a message.** It should arrive within a minute, from `onboarding@resend.dev`, with Reply going to the address you typed.
2. If you see "Something went wrong…", `CONTACT_TO_EMAIL` is probably not the email your Resend account was created with. Resend's test sender can only deliver to that one address.
3. Press **Book a call.** Your Cal.com calendar should load full width under the form.
4. **VoiceOver check** (left over from Slice 4): on `/blog`, the row toggle should read the post title, then "button, collapsed".

## Summary

- **`/contact`:**
  - h1, your intro ("…I reply within 2–3 business days."), then **Send a message** and **Book a call**
  - side by side from 768 px, stacked with the form first below that
- **The form:**
  - **Fields:** Name, Email, Company (optional), Your role (optional), Message, checked in the browser **and** on the server.
  - **Errors:** shown next to each field, with focus on the first one.
  - **Sending:** "Sending…" while it sends; a second click does nothing.
  - **Results:** a sent confirmation that screen readers announce, or "Something went wrong. Try again, or book a call instead."
  - **Turnstile** (managed, invisible unless Cloudflare needs a click) loads on the first click into a field, never with the page. A failed send resets it, so a retry works.
- **`POST /api/contact`:**
  - checks fields, then Turnstile, then sends through Resend's API
  - Reply-To is the visitor; the subject is `Contact: <name> (<company>)`; plain text
  - Responses never contain the visitor's input, your email or any key
  - A missing server setting returns an error and logs the setting's **name** only
- **Book a call.** Nothing from Cal.com loads until the click. Then the calendar fills the full width below the form, takes focus and follows your light or dark theme. If it doesn't load within 10 s, **"Open the booking page"** links straight to Cal.com.
- **No JavaScript:** the form is replaced by "Turn on JavaScript to send a message, or book a call below.", and **Book a call** becomes a plain link.
- **No new packages.** Resend and Turnstile are called with `fetch`.

Design: `docs/superpowers/specs/2026-11-26-slice-05-contact-design.md`. Plan: `docs/plans/slice-05.md`.

## Preview URL

https://portv3-git-slice-05-contact-kynot54s-projects.vercel.app/contact (sign in to Vercel)

## Screenshots

| Desktop, dark                                                                                                                 | Phone, light                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/contact-1440-dark.png?raw=true)       | ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/contact-375-light.png?raw=true) |
| **Field errors**                                                                                                              | **Sent (light)**                                                                                                        |
| ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/errors-1440-dark.png?raw=true)        | ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/sent-1440-light.png?raw=true)   |
| **Calendar open** (test stand-in)                                                                                             | **No JavaScript**                                                                                                       |
| ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/calendar-open-1440-dark.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/05-contact/docs/plans/slice-05-screens/no-js-1440.png?raw=true)        |

## Test evidence

| Check                                                                         | Result                                                                                                                                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                                                     | pass                                                                                                                                                                          |
| Unit (Vitest)                                                                 | **215 passed**, including header injection, a malformed reply-to, bad and oversized bodies, a double-click, the Turnstile reset after failure, and that no secrets are echoed |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox)                    | **428 passed**. Third parties are stubbed, so CI never calls Cloudflare, Cal.com or Resend                                                                                    |
| No third-party request before interaction                                     | asserted                                                                                                                                                                      |
| axe: `/contact` in both themes, plus the error, sent and calendar-open states | 0 violations (third-party iframes excluded)                                                                                                                                   |
| Lighthouse (11 URLs, 3 runs each)                                             | **100 in every category**, `/contact` included                                                                                                                                |

## Needs Kyle's call

- **Placeholder examples** (your request): Name "Jane Smith", Email "jane@company.com", Company "Acme Inc.", Your role "Engineering Manager", Message "Hi Kyle, we're hiring a software engineer and I'd like to talk about the role." They're in muted grey, and the labels still name every field.
- **Copy:**
  - "Send a message", "Book a call", "A 30-minute intro call."
  - the labels, "Send message", "Sending…"
  - the sent, failure and no-JS lines
  - "Open the booking page"
- **Sender address.** Mail comes from `onboarding@resend.dev`. To send from `@kwhynott.dev`, you'd add Resend's DNS records in Cloudflare later; only the From line changes.
- **Resend's official package.** I didn't use it. One `fetch` call does the job with no new dependency. Say if you want it.

- **Remove `localhost` from the production Turnstile widget** (Cloudflare → Turnstile → your widget → Hostnames). My setup guide listed it at first. It lets anyone generate real tokens locally, and local work uses test keys anyway. The guide is now corrected.
- **Confirm Vercel Authentication is on for `portv3` previews.** Previews use the always-pass Turnstile test keys and send real email, so they must stay behind the Vercel login.

## Independent review

A fresh reviewer read the whole branch and found no critical issues and 4 important ones. It confirmed that no secret appears in the client bundle and that `/contact` is static. I fixed these, each with a test I watched fail first:

- **Sending before Turnstile had a token.** This happened when a visitor was fast, when Cloudflare needed a click, or when the script failed, and it always ended in a 403 and "Something went wrong". The form now waits up to 10 s for the token and never posts without one.
- **Malformed emails that Resend would refuse,** such as `kyle@gmail.com,`, `a@b..co` and `"a@b.co"`. They now get "Enter a valid email address." instead of a generic failure.
- **Cross-site form posts.** `/api/contact` now accepts JSON only, and a plain HTML form on another site can't send that.
- **The "sent" message could go unannounced by screen readers,** because its region was `display:none` while empty. It now stays in the accessibility tree, and a browser test checks that.

**I regraded six Minor findings to Important because visitors or your inbox would feel them, and fixed them too:**

- A second message after a successful one failed once. Turnstile is now reset after success.
- A name containing a line break could add a fake line, such as `Email: ceo@bigco.com`, to your email. Control characters and Unicode line breaks are now flattened.
- A hung Cloudflare or Resend call kept "Sending…" up. Both now time out after 10 s.
- Keyboard focus dropped to the page while sending. The button now stays focusable.
- Focus was left in an empty box when the calendar failed. The box now goes away and the booking link takes focus.
- Test mode could switch on inside any Vercel deployment. It's now off on every one.

**Deferred minor findings:**

- The calendar keeps the theme it opened with if you switch themes afterwards.
- "Calendar loaded" means its iframe appeared. If cal.com itself is down, the iframe shows Cal.com's own error and the fallback link doesn't appear.
- There's no idempotency key on the Resend call, so a retry after a lost response could send twice.
- The body size check for chunked requests runs after reading. Vercel's 4.5 MB cap bounds it.
- The accessibility scan of the form states is skipped in Firefox (axe crashes it there). Chromium and WebKit cover it.

## Conflicts flagged

None.

## Notes for Slice 6

- The CSP must allow `challenges.cloudflare.com` (Turnstile script and iframe), and `app.cal.com` and `cal.com` (embed script and iframe).
- Resend's free plan caps sending at 100 emails a day. Turnstile is the only rate limit we have.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
