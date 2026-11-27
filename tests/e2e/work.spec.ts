import { test, expect } from "./fixtures";
import { getWorkList } from "../../src/lib/content/load";

test.describe("work detail pages", () => {
  test("every project page shows CARL sections in order with its content", async ({
    page,
  }) => {
    for (const e of await getWorkList()) {
      const res = await page.goto(`/work/${e.slug}`);
      expect(res?.status(), e.slug).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(e.title);
      const h2 = (await page.locator("main h2").allTextContents()).map((t) =>
        t.trim(),
      );
      expect(h2, e.slug).toEqual([
        "Context",
        "What I built",
        e.impactHeading,
        "What I learned",
        "Built with",
      ]);
      await expect(page.getByText(e.context, { exact: true })).toBeVisible();
      await expect(page.getByText(e.learned, { exact: true })).toBeVisible();
      for (const item of e.impact)
        await expect(page.getByText(item, { exact: true })).toBeVisible();
      const tools = page
        .getByRole("list", { name: "Built with" })
        .getByRole("listitem");
      await expect(tools).toHaveText(e.tools);
      await expect(
        page.getByText(`${e.role} · ${e.location} · ${e.period}`),
      ).toBeVisible();
      await expect(page.getByText("Preview coming soon")).toBeVisible();
    }
  });

  test("a single Result item renders as a paragraph", async ({ page }) => {
    await page.goto("/work/ai-mind-companion");
    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "What it does" }),
    });
    await expect(section.locator("ul")).toHaveCount(0);
    await expect(section.locator("p")).toHaveCount(1);
  });

  test.describe("unknown slugs", () => {
    test.use({ allowedConsole: [/status of 404/] });
    test("unknown and mis-cased slugs return 404 with the not-found page", async ({
      page,
    }) => {
      // macOS's case-insensitive filesystem serves control-bh.html for Control-BH
      // locally; CI (Linux) and Vercel are case-sensitive, so check it there.
      const paths =
        process.platform === "darwin"
          ? ["/work/nope"]
          : ["/work/nope", "/work/Control-BH"];
      for (const path of paths) {
        const res = await page.goto(path);
        expect(res?.status(), path).toBe(404);
        await expect(page.getByRole("heading", { level: 1 }), path).toHaveText(
          "Page not found",
        );
      }
    });
  });

  test("Home and /work cards open the matching detail page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work a").first().click();
    await expect(page).toHaveURL(/\/work\/working-entrepreneurs$/);
    await page.goto("/work");
    await page.getByRole("link", { name: /AI Mind Companion/ }).click();
    await expect(page).toHaveURL(/\/work\/ai-mind-companion$/);
  });

  test("← All work returns to /work with a visible focus ring", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit skips links on Tab by default");
    await page.goto("/work/control-bh");
    const back = page.getByRole("link", { name: "All work", exact: true });
    await back.focus();
    expect(
      await back.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    expect(
      (await back.boundingBox())!.height,
      "44px tap target",
    ).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(page).toHaveURL(/\/work$/);
  });

  test("placeholder fits at 320px and its label passes contrast in light mode", async ({
    browser,
  }, info) => {
    test.skip(info.project.name !== "desktop", "viewport set explicitly");
    const ctx = await browser.newContext({
      viewport: { width: 320, height: 700 },
      colorScheme: "light",
    });
    const page = await ctx.newPage();
    await page.goto("/work/ulti-health");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const label = page.getByText("Preview coming soon");
    const box = await label.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await ctx.close();
  });
});

test("the old pipelines URL lands on Working Entrepreneurs", async ({
  page,
}) => {
  const res = await page.goto("/work/ai-document-pipelines");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/work\/working-entrepreneurs$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Working Entrepreneurs",
  );
});
