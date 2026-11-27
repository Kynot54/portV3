import { test, expect } from "./fixtures";
import { fill, stubThirdParty } from "./third-party";

test("Book a consultation loads the consultation calendar below both columns", async ({
  page,
}) => {
  await stubThirdParty(page);
  await page.goto("/services");
  await expect(page.getByText("A free 30-minute consultation.")).toBeVisible();
  await page.getByRole("button", { name: "Book a consultation" }).click();
  const region = page.getByRole("region", { name: "Booking calendar" });
  await expect(region.locator("iframe")).toHaveAttribute(
    "data-cal-link",
    "test/consultation",
  );
  await expect(region).toBeFocused();
  // Rendered into the Services page's own target, below its grid.
  await expect(page.locator("#booking-calendar [role=region]")).toHaveCount(1);
});

test("a message sent from Services is tagged services", async ({ page }) => {
  await stubThirdParty(page);
  await page.goto("/services");
  await fill(page);
  const sent = page.waitForRequest("**/api/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  expect((await sent).postDataJSON().source).toBe("services");
  await expect(
    page.getByText(
      "Thanks, your message is on its way. I reply within 2–3 business days.",
    ),
  ).toBeVisible();
});

test("the hero's Book a consultation opens the calendar", async ({ page }) => {
  await stubThirdParty(page);
  await page.goto("/services");
  await page.getByRole("link", { name: "Book a consultation" }).click();
  const region = page.getByRole("region", { name: "Booking calendar" });
  await expect(region.locator("iframe")).toHaveAttribute(
    "data-cal-link",
    "test/consultation",
  );
  await expect(region).toBeFocused();
});

test("the hero's Send a message jumps to the form", async ({ page }) => {
  await page.goto("/services");
  await page.getByRole("link", { name: "Send a message" }).click();
  await expect(page).toHaveURL(/#message$/);
  await expect(page.locator("#message")).toBeInViewport();
});

for (const slug of [
  "control-bh",
  "video-interview-plugin",
  "ai-document-pipelines",
])
  test(`the ${slug} card opens its Work page`, async ({ page }) => {
    await page.goto("/services");
    await page.locator(`main a[href="/work/${slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/work/${slug}$`));
  });

test("Home, Contact and the footer link to Services; the nav doesn't", async ({
  page,
}) => {
  for (const path of ["/", "/contact"]) {
    await page.goto(path);
    await page.getByRole("link", { name: "See what I offer" }).click();
    await expect(page).toHaveURL(/\/services$/);
  }
  await page.goto("/work");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Services" })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .locator('a[href="/services"]'),
  ).toHaveCount(0);
});
