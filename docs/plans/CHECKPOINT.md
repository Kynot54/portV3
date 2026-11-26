# Checkpoint: resume here

**Updated:** 2026-11-26 (paused for the night) · **Branch:** `slice/05-contact` (from `main` @ `857b247`, which includes merged PR #7). Everything below is committed and pushed.

## To resume

Open a session in `~/Projects/portV3` and say:

> "Resume from docs/plans/CHECKPOINT.md."

## Where we are

- **Slice 1 (Foundation)** is merged (PR #1).
- **Slice 2 (Home)** is merged (PR #3) and live on `kwhynott.dev`. Kyle merged without changing the PR's "Needs Kyle's call" items, so those defaults stand. Revisit them only if he raises them: section spacing, the visual's size on phones, card labels, hairline joints, two wave points, inset band, grain density.
- **Dependabot:**
  - PR #2 bundles breaking majors (TS 7 fails CI, ESLint 10, `@types/node` 26). Recommended: close it unmerged.
  - PR #4 (`chore/dependabot-safe-updates`) groups minor and patch updates and holds those majors. Kyle merges it.

## Next steps, in order

1. **Slice 5 (Contact) is mid-brainstorm. No design doc and no code yet.** Agreed so far, with Kyle:
   - **Tools: whatever is cheapest and gets the job done.** All on free plans:
     - **Cal.com** for booking (Calendly's free plan allows only one meeting type)
     - **Resend** for email (about 3,000 a month, 100 a day; test sender `onboarding@resend.dev`, which can only send to the account's own email)
     - **Cloudflare Turnstile** for bot protection
   - **The booking calendar loads on click** (Kyle chose A). A "Book a call" button loads the Cal.com embed in place, so there's no third-party script or cookies until then, and Lighthouse stays at 100.
   - **The form** posts to a route handler; Turnstile then Resend; the message lands in Kyle's inbox with the sender's address as reply-to.
   - **Reply time in the copy: "2–3 business days"** (Kyle).
   - **My proposals, which Kyle hasn't approved or corrected yet** (he paused before answering "what's wrong or missing?"):
     - **Layout:** form and booking side by side on desktop, stacked on phones (form first).
     - **Fields:** name, email, company (optional), message, with server-side length limits.
     - **States:** inline sent / field errors / failure ("Something went wrong. Try again, or book a call instead.").
     - **Turnstile** in managed mode, its script loaded when someone starts filling in the form.
     - **Accent:** "Send message" gets the accent; "Book a call" is the outline style.
     - **No JavaScript:** a plain link to the Cal.com page, plus "turn on JavaScript to send a message". Turnstile needs JS.
     - **Intro draft:** "I'm looking for my next role as an AI or software engineer. Send a message or book a call. I reply within 2–3 business days."
     - **Tests:** Cloudflare's test keys plus a fake mailer.
   - **Kyle's setup:** `docs/plans/slice-05-setup.md`, covering the accounts and five Vercel env vars. He may do it from his phone. Otherwise he'll do it tomorrow on the laptop.
   - **On resume:** ask Kyle whether the playback above is right, then lay out any remaining approach choice, write the design doc to `docs/superpowers/specs/`, run the builder check, get his approval, then writing-plans → `docs/plans/slice-05.md`.
2. **After Slice 5:** Slice 6 (launch polish). Its notes are in the Slice 4 PR, `docs/plans/slice-04-pr.md`.

## Done

- **Slices 1–4** are merged (PRs #1, #3, #5, #7) and live. The Blog is hidden on production until Kyle's first post, so the nav reads Work, Contact.

## Notes on the live site

- **The Vercel login wall on `kwhynott.dev` is fixed** (Kyle, 2026-11-26). Anonymous requests no longer redirect to `vercel.com/sso-api`.
- **Vercel's "Security Checkpoint" bot challenge is active** on `kwhynott.dev`: non-browser clients get `429` plus a challenge page. Browsers pass it. Revisit in Slice 6, because it can block search crawlers and link previews (LinkedIn, Slack).
- **`kwhynott.dev` serves V3 by Kyle's choice** (V2 is scrapped). **Every merge to `main` is a production deploy.**

## Environment notes (this machine)

- **npm:** set `npm_config_cache=$TMPDIR/npm-cache`, because the sandbox blocks `~/.npm`.
- **Outside the sandbox:** `next build`, Playwright, Lighthouse, `git` writes and `gh` calls (fonts, ports and `.git`).
- **Tests:**
  - `npm run lint && npm run format:check && npm run typecheck && npm test`
  - `npm run test:e2e` (Playwright on port 3100)
  - `npm run lhci` (Lighthouse on port 3200)
- **Vercel:**
  - **`portv3`:** the V3 previews, at `portv3-git-<branch>-kynot54s-projects.vercel.app`, behind Vercel login.
  - **`portfolio`:** serves `kwhynott.dev`; Kyle set it to build previews only.
  - Never change Vercel production or domain settings.
- **GitHub:** `main` is protected (the `quality` check is required). `gh` has the `workflow` scope.

## Kyle's working preferences

- **Copy:** objective, in his voice, short sentences, plain words, no selling adjectives, no generational labels. Facts only from `content/source/resume.md`.
- **Skills:** keep the superpowers and mattpocock skill sets separate. Flag with "▶ You run:" whenever a step needs a skill only he can type, such as `/mattpocock-skills:grill-me`.
- **Decisions:** when his direction conflicts with the brief, follow it and flag it in the PR under "Conflicts flagged". The "Never do" list stays his alone.
