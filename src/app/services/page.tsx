import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Booking } from "@/components/contact/booking";
import { ContactForm } from "@/components/contact/contact-form";
import { buttonVariants } from "@/components/ui/button";
import { isServicesEnabled } from "@/lib/flags";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/seo";
import { SERVICES_COPY as C } from "@/lib/services-copy";
import { cn } from "@/lib/utils";

// 404 unless SERVICES_ENABLED=true at build time. Never in the nav; linked
// from Home, Contact and the footer while on (Kyle's placement B).
export async function generateMetadata(): Promise<Metadata> {
  if (!isServicesEnabled()) return {};
  return pageMetadata({
    title: "Services",
    description: PAGE_DESCRIPTIONS.services,
    path: "/services",
  });
}

// Public values, baked in at build time (production builds with Services on
// fail without the consultation link).
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;
const calLink = process.env.NEXT_PUBLIC_CAL_CONSULT_LINK || undefined;

const h2 = "text-h2 font-bold tracking-tight";
const h3 = "text-h3 font-semibold tracking-tight";
const muted = "text-body-fluid text-muted-foreground";

export default function ServicesPage() {
  if (!isServicesEnabled()) notFound();
  return (
    <div className="mx-auto w-full max-w-5xl px-gutter py-section">
      <section aria-labelledby="services-title">
        <p className="micro-label text-muted-foreground">{C.label}</p>
        <h1
          id="services-title"
          className="mt-4 text-hero font-bold tracking-tight text-balance"
        >
          {C.title}
        </h1>
        <p className={cn("mt-4 max-w-2xl", muted)}>{C.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {/* No link, no dead end: production can't build without one. */}
          {calLink && (
            <a
              href="#book"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 px-5 text-sm",
              )}
            >
              {C.cta.book}
            </a>
          )}
          <a
            href="#message"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 px-5 text-sm",
            )}
          >
            {C.cta.write}
          </a>
        </div>
      </section>

      <section aria-labelledby="offers-title" className="mt-section">
        <h2 id="offers-title" className={h2}>
          {C.offersTitle}
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {C.offers.map((o) => (
            <li key={o.title} className="rounded-xl border p-5">
              <h3 className={h3}>{o.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{o.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="training-title" className="mt-section">
        <h2 id="training-title" className={h2}>
          {C.training.title}
        </h2>
        <p className={cn("mt-4 max-w-2xl", muted)}>{C.training.text}</p>
      </section>

      <section aria-labelledby="evidence-title" className="mt-section">
        <h2 id="evidence-title" className={h2}>
          {C.evidenceTitle}
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {C.evidence.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/work/${e.slug}`}
                className="flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-foreground/30"
              >
                <h3 className={h3}>{e.title}</h3>
                <span className="text-sm text-muted-foreground">{e.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title" className="mt-section">
        <h2 id="steps-title" className={h2}>
          {C.stepsTitle}
        </h2>
        <ol aria-labelledby="steps-title" className="mt-6 grid gap-4">
          {C.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="micro-label mt-1 text-muted-foreground"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className={muted}>
                <strong className="font-semibold text-foreground">
                  {s.title}
                </strong>{" "}
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="services-contact-title" className="mt-section">
        <h2 id="services-contact-title" className={h2}>
          {C.contact.title}
        </h2>
        <p className={cn("mt-4", muted)}>{C.contact.reply}</p>

        <div data-contact-grid className="mt-12 grid gap-12 md:grid-cols-2">
          <section id="message" aria-labelledby="message-title">
            <h3 id="message-title" className={h3}>
              {C.contact.messageTitle}
            </h3>
            <div className="js-only mt-6">
              <ContactForm siteKey={siteKey} source="services" />
            </div>
            <noscript>
              <p className={cn("mt-6", muted)}>
                Turn on JavaScript to send a message, or book a call below.
              </p>
            </noscript>
          </section>

          <section id="book" aria-labelledby="booking-title">
            <h3 id="booking-title" className={h3}>
              {C.contact.bookingTitle}
            </h3>
            <div className="js-only mt-6">
              <Booking
                calLink={calLink}
                intro={C.contact.bookingIntro}
                label={C.cta.book}
                openOnHash="#book"
                accent
              />
            </div>
            {calLink && (
              <noscript>
                <p className={cn("mt-6", muted)}>{C.contact.bookingIntro}</p>
                <a
                  href={`https://cal.com/${calLink}`}
                  rel="noopener noreferrer"
                  className="link mt-4 inline-flex min-h-11 items-center text-sm"
                >
                  {C.cta.book}
                </a>
              </noscript>
            )}
          </section>
        </div>

        {/* The calendar renders here once requested, full width below both columns. */}
        <div id="booking-calendar" />
      </section>
    </div>
  );
}
