import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// iPhone home-screen icon. The letters come from icon.svg, so the two can't
// drift. iOS rounds the corners itself and ignores the system theme, so this
// is a full square in the dark (default) colours.
const svg = await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8");
const letters = /<path class="fg" d="([^"]+)"/.exec(svg)?.[1];
if (!letters) throw new Error("icon.svg: no KW path");

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#000000",
      }}
    >
      <svg width="180" height="180" viewBox="0 0 64 64">
        <path d={letters} fill="#39ff14" />
      </svg>
    </div>,
    size,
  );
}
