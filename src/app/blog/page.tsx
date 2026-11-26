import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Blog</h1>
      {/* TODO(kyle): replaced in Slice 04 */}
      <p className="mt-4 text-body-fluid text-muted-foreground">
        Placeholder. This page arrives in Slice 04.
      </p>
    </section>
  );
}
