import { readFileSync } from "node:fs";
import { token } from "../support/tokens";

// Rows look like: | `--background` | #000000 | #FFFFFF | ... |
const doc = readFileSync("docs/design-tokens.md", "utf8");
const rows = [
  ...doc.matchAll(
    /^\|\s*`--([a-z-]+)`\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|/gm,
  ),
];

test("the doc lists the palette", () => {
  expect(rows.length).toBeGreaterThanOrEqual(8);
});

test.each(rows.map((r) => [r[1], r[2].toUpperCase(), r[3].toUpperCase()]))(
  "doc row --%s matches globals.css (dark %s, light %s)",
  (name, dark, light) => {
    expect(token("dark", name)).toBe(dark);
    expect(token("light", name)).toBe(light);
  },
);
