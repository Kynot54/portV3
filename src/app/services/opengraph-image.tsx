import { notFound } from "next/navigation";
import { isServicesEnabled } from "@/lib/flags";
import { CARD_SIZE, CARD_TYPE, cardAlt, renderCard } from "@/lib/og-card";

export const alt = cardAlt("Services");
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default function Image() {
  if (!isServicesEnabled()) notFound();
  return renderCard("Services");
}
