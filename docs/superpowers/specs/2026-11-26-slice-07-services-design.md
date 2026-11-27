# Slice 7: Services (design)

**Status:** approved by Kyle, 2026-11-27, with his answers below. Branch `slice/07-services`.

## Intent

A `/services` page for Kyle's consulting offer. It's for entrepreneurs and founders with no IT, tech or AI background who want to grow their digital presence or need custom software. The page has two jobs (Kyle's words, paraphrased):

1. Describe accurately what Kyle can do for them.
2. Get them into a meeting, where Kyle works out which solution they need.

The solutions range from a simple website to a custom CRM to an app that solves one problem in their niche. Kyle also teaches teams how to use technology and AI.

The site's main audience is still employers. The page must not change what an employer sees first.

## Decided with Kyle

- **Services is consulting, not repair.** Work orders, technician scheduling and card holds belonged to Kyle's side business. They're out.
- **No admin for posts.** Kyle keeps writing posts as MDX files and committing them. No login, no database.
- **Placement B:** not in the nav. The page is linked from Home's contact section, the Contact page and the footer, only while Services is on.
- **Booking on the page (option 1):** a "Book a consultation" button opens Cal.com in place, using a new consultation event type. The contact form is also on the page.
- **Training offer:** backed by Teacher of Record for CPSC 483 and the C++ teaching, added to `content/source/resume.md` from Kyle's CV.
- **O'Hagan Electrical:** hiring efficiency is "over 35%" (Kyle's safe estimate; in PR #12).

## Approaches considered (where to book)

1. **Booking on the Services page (chosen).** It reuses the `Booking` component with a second Cal link. The founder never leaves the page that convinced them, and Kyle's calendar shows who they are. Cost: one more setting.
2. **Send them to `/contact?for=project`.** One booking place, but founders land on a page written for employers ("I'm looking for my next role").

Ruled out: a custom booking form, prices on the page, and a request-a-quote form. Kyle scopes and prices in the meeting.

## Goals, non-goals, anti-goals

- **Goals:** accurate copy that a non-technical founder understands; one clear action (book a consultation); the contact form for founders who would rather write; Kyle can tell founder messages and bookings from recruiter ones.
- **Non-goals:** payments, scheduling beyond Cal.com, work orders, an admin, accounts, prices, testimonials.
- **Anti-goals:**
  - Selling language ("take your business to the next level").
  - Any claim not in `resume.md`.
  - Services crowding Kyle's "open to work" message.

## How it works

- **Flag:** the route stays 404 unless `SERVICES_ENABLED=true`, as today. Kyle turns it on in Vercel Production once the copy is approved and the Cal event exists.
- **New public setting:** `NEXT_PUBLIC_CAL_CONSULT_LINK` (the consultation event, such as `kwhynott/consultation`). Kyle creates the event in Cal.com and adds the setting. A production build with Services on fails without it, the same rule as the existing Cal link.
- **Page:** server-rendered and prerendered, built from the existing pieces:
  - `Booking`, with the consultation link and its own button label.
  - `ContactForm`, sending `source: "services"`. The email subject becomes "Services: Name (Company)" instead of "Contact: …". The fields are unchanged: "Company (optional)" and "Your role (optional)" fit a founder too.
- **Tags:** `pageMetadata` for `/services`, its own 1200×630 card (prebuilt), and a sitemap entry (already gated by the flag).
- **Links (only while on):**
  - Home's contact section: one line.
  - The Contact page: one line under the intro.
  - The footer: a "Services" link.
- **Copy** lives in the page component, checked by the facts test like Home and Work. `docs/plans/services.md` points to it.
- **Quality bar:** same as every slice. Axe 0, Lighthouse 1.0 on accessibility and at least 0.95 elsewhere, no CSP changes (Cal.com's origins are already allowed), and e2e tests with Services on.

## Page copy (first draft, needs Kyle's approval)

Every figure maps to a `resume.md` phrase. Approved by Kyle (2026-11-27), apart from step 4's new wording.

**Description (meta, 100–160 characters):**
"I build websites and custom software for founders and small businesses, and I teach teams to use technology and AI. It starts with a free call." (143 characters)

**Hero**

- Label: `SERVICES`
- **h1:** "Software for your business, built around how it works."
- Lead: "I build websites and custom software for founders and small businesses. You don't need a technical background. We start with a call, and I work out what you need."
- Buttons: **Book a consultation** (opens the calendar) · Send a message (jumps to the form).

**What I build**

- **Websites.** A site that shows what you do and makes it easy for customers to reach you.
- **Custom software.** A CRM, an intake or booking tool, or an app that solves one problem in your niche, built around how your business already works.
- **AI that takes on repetitive work.** Pipelines that read documents and handle routine steps, so your team spends less time on manual review. _Evidence: the AI document pipelines for 50+ clients._

**Teaching your team**

"I teach teams to use technology and AI in their day-to-day work. At Cal State Fullerton I was Teacher of Record for Introduction to Machine Learning: two sections of 40+ students each, on a course I designed myself. I also taught C++ lectures and labs for 60+ students."

**Work I've done for businesses**

Three cards, linked to their Work pages:

- **C.O.N.T.R.O.L. BH:** "A donation web app for a nonprofit, built in under two weeks and maintained for a year. 1,000+ users; donations rose 40%."
- **O'Hagan Electrical:** "A video-interview plugin that screened 100+ applicants. Hiring efficiency rose over 35%."
- **AI document pipelines:** "Pipelines for 50+ clients that cut manual review by 50%."

**How it works**

1. **A free 30-minute call.** You tell me about your business and the problem. No technical knowledge needed.
2. **A plan and a price.** I write up what I'd build, how long it takes, and what it costs.
3. **I build it.** You see progress as it happens.
4. **Hand-off and upkeep.** I show your team how to use it. You own it, and its running costs (hosting and services) move to your accounts. I maintain it for a monthly fee until you have someone else to take it over.

**Contact block**

- **h2:** "Tell me about your business"
- Book a consultation (calendar) and the contact form, side by side like the Contact page.
- Reply line: "I reply within 2–3 business days." (same promise as Contact)

**Link lines**

- **Home and Contact:** "Run a business and need software built? See what I offer." → `/services`
- **Footer:** "Services"

## Kyle's answers (2026-11-27)

1. **The call is free and 30 minutes.**
2. **AI automation is in** as the third build offer.
3. **Maintenance:** operating costs are handed off to the client. Kyle maintains the software at a monthly rate until the client hires someone else to maintain it; only then does he stop. (Step 4's wording is new copy: confirm it in the PR.)
4. **Evidence:** C.O.N.T.R.O.L. BH, O'Hagan Electrical and the AI document pipelines.

## Left to the builder

Layout within the existing design system (tokens, the Work card style, monospace micro-labels), component names, test structure, and the exact flag and env-var wiring.
