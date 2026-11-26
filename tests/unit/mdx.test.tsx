import { render, screen } from "@testing-library/react";
import { renderMdx } from "@/lib/mdx";
import { getWorkList } from "@/lib/content/load";

test("renders paragraphs and styled links", async () => {
  render(await renderMdx("Hello [site](https://example.com)."));
  expect(screen.getByText(/Hello/).tagName).toBe("P");
  const link = screen.getByRole("link", { name: "site" });
  expect(link).toHaveClass("link");
  expect(link).toHaveAttribute("rel", "noopener");
});

test("renderMdx throws on invalid MDX", async () => {
  await expect(renderMdx("<Unclosed")).rejects.toThrow();
});

test("every real work body renders as at least one paragraph", async () => {
  for (const e of await getWorkList()) {
    const { container, unmount } = render(await renderMdx(e.body));
    expect(container.querySelectorAll("p").length, e.slug).toBeGreaterThan(0);
    unmount();
  }
});
