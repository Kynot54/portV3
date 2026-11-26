import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog/blog-list";
import { blogPosts } from "@/lib/blog";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: PAGE_DESCRIPTIONS.blog,
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await blogPosts();
  // Hidden until the first published post (Slice 4 design, option B).
  if (posts.length === 0) notFound();
  return (
    <section className="mx-auto w-full max-w-3xl px-gutter py-section">
      <h1 className="text-hero font-bold tracking-tight">Blog</h1>
      <BlogList posts={posts} />
    </section>
  );
}
