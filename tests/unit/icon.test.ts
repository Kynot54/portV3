import { readFileSync } from "node:fs";

test("favicon letters are outlines, not text (browsers can't load Geist in a favicon)", () => {
  const svg = readFileSync("src/app/icon.svg", "utf8");
  expect(svg).not.toMatch(/<text\b/);
  expect(svg).toMatch(/<path\b[^>]*class="fg"/);
});
