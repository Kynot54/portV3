import { CARD_SIZE, CARD_TYPE, cardAlt, renderCard } from "@/lib/og-card";

export const alt = cardAlt("Blog");
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default function Image() {
  return renderCard("Blog");
}
