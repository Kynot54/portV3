import { contrastRatio } from "../support/contrast";
import { token } from "../support/tokens";

test.each([
  ["dark", "foreground", "background", 19],
  ["dark", "muted-foreground", "background", 6],
  ["dark", "keyword", "background", 8],
  ["dark", "ring", "background", 8],
  ["dark", "primary-foreground", "primary", 15],
  ["light", "foreground", "background", 19],
  ["light", "muted-foreground", "background", 5.3],
  ["light", "keyword", "background", 6.7],
  ["light", "ring", "background", 6.7],
  ["light", "primary-foreground", "primary", 5.5],
  ["light", "primary", "background", 3.7],
] as const)("%s: %s on %s ≥ %s:1", (theme, fg, bg, min) => {
  expect(
    contrastRatio(token(theme, fg), token(theme, bg)),
  ).toBeGreaterThanOrEqual(min);
});

test("palette values match the spec exactly", () => {
  expect(token("dark", "background")).toBe("#000000");
  expect(token("dark", "foreground")).toBe("#F5F5F5");
  expect(token("dark", "muted-foreground")).toBe("#8A8A8A");
  expect(token("dark", "primary")).toBe("#39FF14");
  expect(token("dark", "primary-foreground")).toBe("#000000");
  expect(token("dark", "ring")).toBe("#60A5FA");
  expect(token("dark", "keyword")).toBe("#60A5FA");
  expect(token("light", "background")).toBe("#FFFFFF");
  expect(token("light", "foreground")).toBe("#0A0A0A");
  expect(token("light", "muted-foreground")).toBe("#6B6B6B");
  expect(token("light", "primary")).toBe("#FF0080");
  expect(token("light", "primary-foreground")).toBe("#000000");
  expect(token("light", "ring")).toBe("#1D4ED8");
  expect(token("light", "keyword")).toBe("#1D4ED8");
});
