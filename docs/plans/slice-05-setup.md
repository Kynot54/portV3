# Slice 05 (Contact): account setup for Kyle

Do these yourself. I never create accounts or handle secrets. **Never paste a key into chat or commit it.** Keys go only into Vercel's environment settings. Every service here is on its free plan.

You need five values at the end:

| Vercel variable                  | What it is                                | Secret? |
| -------------------------------- | ----------------------------------------- | ------- |
| `RESEND_API_KEY`                 | Resend API key (starts `re_`)             | yes     |
| `CONTACT_TO_EMAIL`               | The inbox messages go to                  | yes     |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public by design)     | no      |
| `TURNSTILE_SECRET_KEY`           | Turnstile secret key                      | yes     |
| `NEXT_PUBLIC_CAL_LINK`           | Your Cal.com link path, e.g. `kyle/30min` | no      |

## 1. Resend (email delivery), about 5 minutes

1. Sign up at resend.com **with the email address you want messages delivered to.** That matters: until a domain is verified, Resend's test sender (`onboarding@resend.dev`) can only send to the account's own email.
2. Go to **API Keys → Create API key**. Name it `kwhynott.dev`, choose **Sending access**, and copy the key.
3. `CONTACT_TO_EMAIL` is the same email you signed up with.
4. Skip domain setup for now. Sending from `@kwhynott.dev` later means adding DNS records in Cloudflare. That's optional and can come after launch.

## 2. Cloudflare Turnstile (bot check), about 5 minutes

1. In the Cloudflare dashboard (same account as your DNS): **Turnstile → Add widget**.
2. Name it `kwhynott.dev contact`. Add the hostnames `kwhynott.dev` and `localhost`.
3. Widget mode: **Managed**. Most visitors see no puzzle.
4. Copy the **Site key** and the **Secret key**.

## 3. Cal.com (booking), about 10 minutes

1. Sign up at cal.com and connect the calendar you actually use, so busy times are blocked.
2. Create one event type: **30 min intro call** (rename it if you like). Set your available hours and a buffer if you want one.
3. Your link looks like `cal.com/<username>/30min`. The value for Vercel is the part after `cal.com/`, for example `kyle/30min`.

## 4. Vercel environment variables, about 5 minutes (easier on a laptop)

Two projects are involved:

- **`portfolio`** (serves kwhynott.dev): add all five under **Production**, with the real Turnstile keys.
- **`portv3`** (PR previews): add all five under **Preview**. For Turnstile there, use Cloudflare's official always-pass test keys, so previews work on any `*.vercel.app` address without listing hostnames:
  - site key `1x00000000000000000000AA`
  - secret `1x0000000000000000000000000000000AA`

  Previews will then send real emails to you through Resend. That's how you test it end to end.

Then tell me "keys are in". The code reads them by these exact names. Until they exist, the page builds and tests run on test keys and a fake mailer.
