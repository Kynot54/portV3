import {
  CARD_SIZE,
  CARD_TYPE,
  cardAlt,
  renderCard,
  HOME_CARD_TITLE,
} from "@/lib/og-card";

export const alt = cardAlt(HOME_CARD_TITLE);
export const size = CARD_SIZE;
export const contentType = CARD_TYPE;

export default function Image() {
  return renderCard(HOME_CARD_TITLE);
}
