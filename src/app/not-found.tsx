import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Page not found</h1>
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
