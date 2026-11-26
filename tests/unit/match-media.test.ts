import { setPrefersDark, setMinWidth640 } from "../support/match-media";

test("prefers-color-scheme reflects setPrefersDark and notifies listeners", () => {
  setPrefersDark(false);
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  expect(mql.matches).toBe(false);
  const seen: boolean[] = [];
  mql.addEventListener("change", (e) => seen.push(e.matches));
  setPrefersDark(true);
  expect(window.matchMedia("(prefers-color-scheme: dark)").matches).toBe(true);
  expect(seen).toEqual([true]);
});

test("legacy addListener also fires", () => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const fn = vi.fn();
  mql.addListener(fn);
  setPrefersDark(true);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("min-width 640 reflects setMinWidth640", () => {
  setMinWidth640(true);
  expect(window.matchMedia("(min-width: 640px)").matches).toBe(true);
  setMinWidth640(false);
  expect(window.matchMedia("(min-width: 640px)").matches).toBe(false);
});
