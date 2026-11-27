import type { Metadata } from "next";
import Link from "next/link";

// Next adds robots noindex to every 404 itself.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Page Not Found</h1>
      <p className="mt-4 text-body-fluid text-muted-foreground">
        That page doesn&apos;t exist.{" "}
        <Link href="/" className="link">
          Go home
        </Link>
        .
      </p>
    </section>
  );
}
