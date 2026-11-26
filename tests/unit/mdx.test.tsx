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

const HEADINGS = "## Two\n\n### Three\n\n#### Four\n";
const levels = (c: HTMLElement) =>
  [...c.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName);

test("headingOffset 0 renders ## as h2, ### as h3, #### as h4", async () => {
  const { container } = render(await renderMdx(HEADINGS));
  expect(levels(container)).toEqual(["H2", "H3", "H4"]);
});

test("headingOffset 1 renders ## as h3, ### as h4, #### as h5", async () => {
  const { container } = render(await renderMdx(HEADINGS, { headingOffset: 1 }));
  expect(levels(container)).toEqual(["H3", "H4", "H5"]);
});

test("renders ol, blockquote, hr, inline code", async () => {
  const { container } = render(
    await renderMdx("1. a\n2. b\n\n> quoted\n\n---\n\nUse `x`.\n"),
  );
  expect(container.querySelector("ol")).toHaveClass("list-decimal");
  expect(container.querySelector("blockquote")).toHaveClass("border-l-2");
  expect(container.querySelector("hr")).not.toBeNull();
  expect(container.querySelector("p code")).toHaveClass("font-mono");
});

test("pre is focusable and scrolls", async () => {
  const { container } = render(await renderMdx("```ts\nconst a = 1;\n```\n"));
  const pre = container.querySelector("pre")!;
  expect(pre).toHaveAttribute("tabindex", "0");
  expect(pre).toHaveClass("overflow-x-auto", "font-mono");
});

test("a stray # heading never becomes a second h1", async () => {
  const page = render(await renderMdx("# One\n"));
  expect(levels(page.container)).toEqual(["H2"]);
  page.unmount();
  const inline = render(
    await renderMdx("# One\n\n##### Five\n", { headingOffset: 1 }),
  );
  expect(levels(inline.container)).toEqual(["H3", "H6"]);
});
