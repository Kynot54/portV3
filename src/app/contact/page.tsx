import type { Metadata } from "next";
import { Booking } from "@/components/contact/booking";
import { ContactForm } from "@/components/contact/contact-form";
import { ServicesLinkLine } from "@/components/services-link-line";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: PAGE_DESCRIPTIONS.contact,
  path: "/contact",
});

// Public values, baked in at build time (production builds fail without them).
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;
const calLink = process.env.NEXT_PUBLIC_CAL_LINK || undefined;

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-2xl text-body-fluid text-muted-foreground">
        I&apos;m looking for my next role as an AI or software engineer. Send a
        message or book a call. I reply within 2–3 business days.
      </p>
      <ServicesLinkLine className="mt-3 max-w-2xl" />

      <div data-contact-grid className="mt-12 grid gap-12 md:grid-cols-2">
        <section aria-labelledby="message-title">
          <h2 id="message-title" className="text-h3 font-bold tracking-tight">
            Send a Message
          </h2>
          <div className="js-only mt-6">
            <ContactForm siteKey={siteKey} />
          </div>
          <noscript>
            <p className="mt-6 text-body-fluid text-muted-foreground">
              Turn on JavaScript to send a message, or book a call below.
            </p>
          </noscript>
        </section>

        <section aria-labelledby="booking-title">
          <h2 id="booking-title" className="text-h3 font-bold tracking-tight">
            Book a Call
          </h2>
          <div className="js-only mt-6">
            <Booking calLink={calLink} />
          </div>
          {calLink && (
            <noscript>
              <p className="mt-6 text-body-fluid text-muted-foreground">
                A 30-minute intro call.
              </p>
              <a
                href={`https://cal.com/${calLink}`}
                rel="noopener noreferrer"
                className="link mt-4 inline-flex min-h-11 items-center text-sm"
              >
                Book a call
              </a>
            </noscript>
          )}
        </section>
      </div>

      {/* The calendar renders here once requested, full width below both columns. */}
      <div id="booking-calendar" />
    </section>
  );
}
