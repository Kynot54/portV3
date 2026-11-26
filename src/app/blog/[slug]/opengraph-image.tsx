import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog";
import { CARD_SIZE, CARD_TYPE, cardAlt, renderCard } from "@/lib/og-card";

const postFor = async (slug: string) =>
  (await blogPosts()).find((p) => p.slug === slug) ?? null;

// Mirrors the post page: the reserved "none" sentinel when there are no posts.
export async function generateStaticParams() {
  const slugs = (await blogPosts()).map((p) => ({ slug: p.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "none" }];
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await postFor((await params).slug);
  return [
    {
      id: "card",
      alt: cardAlt(post?.title ?? "Blog"),
      size: CARD_SIZE,
      contentType: CARD_TYPE,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await postFor((await params).slug);
  if (!post) notFound();
  return renderCard(post.title);
}
