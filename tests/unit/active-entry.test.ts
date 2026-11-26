import { activeEntry } from "@/components/blog/active-entry";

const vh = 900;
const e = (slug: string, top: number, bottom: number) => ({
  slug,
  top,
  bottom,
});

test("no open entry on screen → null", () => {
  expect(activeEntry([], vh)).toBeNull();
  expect(activeEntry([e("a", -2000, -10), e("b", 950, 3000)], vh)).toBeNull();
});

test("the open entry taking most of the screen is the one being read", () => {
  expect(activeEntry([e("a", -500, 200), e("b", 200, 2000)], vh)).toBe("b");
  expect(activeEntry([e("a", -500, 700), e("b", 700, 2000)], vh)).toBe("a");
});

test("an entry just opened near the bottom still counts when it's the only one", () => {
  expect(activeEntry([e("a", 820, 1600)], vh)).toBe("a");
});
