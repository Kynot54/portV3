import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const PROOF =
  "Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering";

/** Animations whose target (or pseudo-element host) is inside the visual band. */
const bandAnimations = (page: Page) =>
  page.evaluate(() => {
    const band = document.querySelector(".three-eras")!;
    return document.getAnimations().filter((a) => {
      const t = (a.effect as KeyframeEffect | null)?.target;
      return !!t && (t === band || band.contains(t));
    }).length;
  });

test.describe("three eras visual", () => {
  test("visual animates by default", async ({ page }) => {
    await page.goto("/");
    expect(await bandAnimations(page)).toBeGreaterThan(0);
  });

  test("reduced motion freezes every animation in the visual", async ({
    browser,
  }, info) => {
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      viewport: info.project.use.viewport,
    });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await bandAnimations(page)).toBe(0);
    const names = await page.evaluate(() => {
      const band = document.querySelector(".three-eras")!;
      const els = [band, ...band.querySelectorAll("*")];
      return els.flatMap((el) => [
        getComputedStyle(el).animationName,
        getComputedStyle(el, "::before").animationName,
        getComputedStyle(el, "::after").animationName,
      ]);
    });
    expect(names.every((n) => n === "none")).toBe(true);
    await ctx.close();
  });

  test("band sits below the proof line at 320, 375 and 1440 and at 200% zoom", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "viewport sweep runs once");
    for (const [w, h, zoom] of [
      [320, 640, 1],
      [375, 667, 1],
      [1440, 900, 1],
      [1280, 800, 2],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      if (zoom !== 1)
        await page.evaluate(
          (z) => (document.documentElement.style.zoom = String(z)),
          zoom,
        );
      const [proof, band] = await Promise.all([
        page.getByText(PROOF).boundingBox(),
        page.locator(".three-eras").boundingBox(),
      ]);
      expect(band!.y, `${w}px zoom ${zoom}`).toBeGreaterThanOrEqual(
        proof!.y + proof!.height,
      );
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        `${w}px zoom ${zoom} horizontal scroll`,
      ).toBe(true);
    }
  });

  test("hero band has a fixed height in CSS (no layout shift)", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop", "measured at 1440");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const early = (await page.locator(".three-eras").boundingBox())!.height;
    await page.waitForLoadState("load");
    const late = (await page.locator(".three-eras").boundingBox())!.height;
    expect(late).toBe(early);
    expect(late).toBeGreaterThanOrEqual(160);
    expect(late).toBeLessThanOrEqual(220);
  });

  test("points use the accent; lines don't", async ({ page }) => {
    await page.goto("/");
    const r = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--primary)";
      document.body.append(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      const pts = [...document.querySelectorAll(".three-eras .te-point")].map(
        (p) => getComputedStyle(p).fill,
      );
      const lines = [...document.querySelectorAll(".three-eras .te-line")].map(
        (l) => getComputedStyle(l).stroke,
      );
      return { accent, pts, lines };
    });
    expect(r.pts.length).toBeGreaterThan(0);
    expect(r.pts.every((f) => f === r.accent)).toBe(true);
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.lines.some((s) => s === r.accent)).toBe(false);
  });
});

test.describe("hero text wrapping", () => {
  for (const width of [375, 1440]) {
    test(`open-to-work dot stays beside its label at ${width}px`, async ({
      page,
    }, info) => {
      test.skip(info.project.name !== "desktop", "viewport set explicitly");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const label = page.getByText("Open to work · AI / Software Engineer");
      const dot = label.locator("[data-dot]");
      const [d, l] = await Promise.all([
        dot.boundingBox(),
        label.boundingBox(),
      ]);
      // The dot sits on the label's first line, just before the text.
      expect(d!.y).toBeLessThan(l!.y + 24);
      const firstWordX = await label.evaluate((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node && !node.textContent!.includes("Open"))
          node = walker.nextNode();
        const i = node!.textContent!.indexOf("Open");
        const r = document.createRange();
        r.setStart(node!, i);
        r.setEnd(node!, i + 1);
        return r.getBoundingClientRect().x;
      });
      expect(firstWordX - (d!.x + d!.width)).toBeLessThan(16);
    });

    test(`proof line items are never split across lines at ${width}px`, async ({
      page,
    }, info) => {
      test.skip(info.project.name !== "desktop", "viewport set explicitly");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const items = page.locator("[data-proof-item]");
      await expect(items).toHaveCount(3);
      // Distinct line tops per item: 1 means the item sits on a single line.
      const lines = await items.evaluateAll((els) =>
        els.map(
          (e) =>
            new Set([...e.getClientRects()].map((r) => Math.round(r.top))).size,
        ),
      );
      for (const n of lines) expect(n).toBe(1);
    });
  }
});
