import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostMeta } from "@/components/blog/post-meta";
import { blogPosts } from "@/lib/blog";
import { renderMdx } from "@/lib/mdx";

// Fully static; unknown slugs resolve before the response, so notFound() is a
// real HTTP 404 (Next 16 ensureStatic), as on /work/[slug].
export const ensureStatic = "navigation";

async function postFor(slug: string) {
  return (await blogPosts()).find((p) => p.slug === slug) ?? null;
}

export async function generateStaticParams() {
  const slugs = (await blogPosts()).map((p) => ({ slug: p.slug }));
  // Cache Components rejects an empty list. "none" is a reserved slug no post
  // can take, so with zero posts it prerenders as a 404 and nothing else exists.
  return slugs.length > 0 ? slugs : [{ slug: "none" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await postFor((await params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await postFor((await params).slug);
  if (!post) notFound();
  const body = await renderMdx(post.body);

  return (
    <article className="mx-auto w-full max-w-3xl px-gutter py-section">
      <Link
        href="/blog"
        className="link inline-flex min-h-11 items-center text-sm"
      >
        <span aria-hidden="true">←&nbsp;</span>All posts
      </Link>
      <h1 className="mt-8 text-hero font-bold tracking-tight">{post.title}</h1>
      <PostMeta post={post} className="mt-4" />
      <div className="mt-10">{body}</div>
    </article>
  );
}
