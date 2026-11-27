import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isServicesEnabled } from "@/lib/flags";

// Not shipped in V3: 404 unless SERVICES_ENABLED=true at build time.
// Never in the nav or the sitemap while off. Its own tags come when it ships.
// While off, the 404 gets Next's own noindex.
export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  if (!isServicesEnabled()) notFound();
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Services</h1>
      {/* TODO(kyle): copy lives in docs/plans/services.md */}
      <p className="mt-4 text-body-fluid text-muted-foreground">Placeholder.</p>
    </section>
  );
}
