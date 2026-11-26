import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Contact</h1>
      {/* TODO(kyle): replaced in Slice 05 */}
      <p className="mt-4 text-body-fluid text-muted-foreground">
        Placeholder. This page arrives in Slice 05.
      </p>
    </section>
  );
}
