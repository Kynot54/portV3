import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { getWorkList } from "@/lib/content/load";
import { CARD_SIZE, CARD_TYPE, renderCard } from "@/lib/og-card";

async function workList() {
  "use cache";
  cacheLife("max");
  return getWorkList();
}
const entryFor = async (slug: string) =>
  (await workList()).find((e) => e.slug === slug) ?? null;

export async function generateStaticParams() {
  return (await workList()).map((e) => ({ slug: e.slug }));
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
  const entry = await entryFor((await params).slug);
  if (!entry) notFound();
  return renderCard(entry.title);
}
