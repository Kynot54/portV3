import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog";
import { CARD_SIZE, CARD_TYPE, renderCard } from "@/lib/og-card";

const postFor = async (slug: string) =>
  (await blogPosts()).find((p) => p.slug === slug) ?? null;

// Mirrors the post page: the reserved "none" sentinel when there are no posts.
export async function generateStaticParams() {
  const slugs = (await blogPosts()).map((p) => ({ slug: p.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "none" }];
}

// No generateImageMetadata: with it, Next renders the card on first request
// instead of at build. The page sets the alt (pageMetadata's image).
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await postFor((await params).slug);
  if (!post) notFound();
  return renderCard(post.title);
}
