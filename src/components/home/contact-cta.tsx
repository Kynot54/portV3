import Link from "next/link";
import { ServicesLinkLine } from "@/components/services-link-line";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContactCta() {
  return (
    <section
      aria-labelledby="contact-title"
      className="mx-auto w-full max-w-5xl px-gutter py-section"
    >
      <div className="flex flex-col items-start gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 id="contact-title" className="text-h2 font-bold tracking-tight">
            Contact
          </h2>
          <p className="mt-3 max-w-xl text-body-fluid text-muted-foreground">
            I&apos;m looking for my next role as an AI or software engineer.
            Let&apos;s talk.
          </p>
          <ServicesLinkLine className="mt-3 max-w-xl" />
        </div>
        <Link
          href="/contact"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 shrink-0 px-5 text-sm",
          )}
        >
          Get in touch →
        </Link>
      </div>
    </section>
  );
}
