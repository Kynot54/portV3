import { nextTheme, themeLabel } from "@/lib/theme";

test("cycles system → light → dark → system", () => {
  expect(nextTheme("system")).toBe("light");
  expect(nextTheme("light")).toBe("dark");
  expect(nextTheme("dark")).toBe("system");
});

test("label names current and next", () => {
  expect(themeLabel("system")).toBe("Theme: System. Switch to light");
  expect(themeLabel("light")).toBe("Theme: Light. Switch to dark");
  expect(themeLabel("dark")).toBe("Theme: Dark. Switch to system");
});
