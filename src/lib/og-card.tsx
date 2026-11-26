import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Link-preview card size (LinkedIn, Slack, X). */
export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_TYPE = "image/png";
export const HOME_CARD_TITLE = "I'm Kyle Whynott, an AI engineer.";

/** "<title>, Kyle Whynott", without the title's end punctuation (no ".,"). */
export const cardAlt = (title: string) =>
  `${title.replace(/[.!?…]+$/, "")}, Kyle Whynott`;

// Read once when the module loads (as in Next's docs), not per request: under
// Cache Components a read during rendering counts as uncached I/O.
const geist = await readFile(
  join(process.cwd(), "src/assets/fonts/Geist-Bold.ttf"),
);

/**
 * The shared preview card: dark, the page title large, the open-to-work dot.
 * Rendered at build time; the font is read from the repo, never fetched.
 */
export async function renderCard(title: string): Promise<ImageResponse> {
  const grey = "#8A8A8A";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#000000",
        color: "#F5F5F5",
        fontFamily: "Geist",
      }}
    >
      <div style={{ fontSize: 40, letterSpacing: -1 }}>KW</div>
      <div
        style={{
          fontSize: title.length > 48 ? 64 : 76,
          lineHeight: 1.08,
          letterSpacing: -2,
          maxWidth: 1040,
          display: "flex",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 30,
          color: grey,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#39FF14",
            }}
          />
          Kyle Whynott · AI / Software engineer
        </div>
        <div>kwhynott.dev</div>
      </div>
    </div>,
    {
      ...CARD_SIZE,
      fonts: [{ name: "Geist", data: geist, weight: 700, style: "normal" }],
    },
  );
}
