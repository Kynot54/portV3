import { buttonVariants } from "@/components/ui/button";

test("accent (default) button brightens/dims and never moves", () => {
  const cls = buttonVariants({ variant: "default" });
  expect(cls).toContain("hover:brightness-110");
  expect(cls).toContain("active:brightness-95");
  expect(cls).toContain("accent-glow");
  expect(cls).not.toMatch(/(^|[\s:])-?(translate|scale)-/);
});

test("outline (secondary) button is quiet grey, never the accent", () => {
  const cls = buttonVariants({ variant: "outline" });
  expect(cls).not.toMatch(/bg-primary|text-primary|text-keyword/);
});
