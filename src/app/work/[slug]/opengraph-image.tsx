import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { getWorkList } from "@/lib/content/load";
import { CARD_SIZE, CARD_TYPE, cardAlt, renderCard } from "@/lib/og-card";

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

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const entry = await entryFor((await params).slug);
  return [
    {
      id: "card",
      alt: cardAlt(entry?.title ?? "Work"),
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
  const entry = await entryFor((await params).slug);
  if (!entry) notFound();
  return renderCard(entry.title);
}
