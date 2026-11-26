import { render } from "@testing-library/react";
import { BlogController } from "@/components/blog/blog-controller";
import { BlogEntry } from "@/components/blog/blog-entry";
import type { BlogPost } from "@/lib/content/types";

// jsdom has no layout, so no scrollIntoView.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const post: BlogPost = {
  slug: "tools",
  title: "Tools",
  summary: "S.",
  description: null,
  date: "2026-11-01",
  tags: [],
  placeholder: false,
  draft: false,
  body: "Body.",
};

async function mount(hash: string) {
  history.replaceState(null, "", `/blog${hash}`);
  const entry = await BlogEntry({ post });
  return render(
    <>
      {/* A hidden page Next keeps under <Activity> can reuse the same id. */}
      <section id="tools" hidden>
        <h2 id="tools-title">Built with</h2>
      </section>
      <ul className="blog-list">{entry}</ul>
      <BlogController slugs={["tools"]} />
    </>,
  );
}

test("a hash opens the list entry, not another element with that id", async () => {
  const { container } = await mount("#tools");
  const details = container.querySelector<HTMLDetailsElement>(
    "li.blog-entry details[data-entry]",
  )!;
  expect(details.open).toBe(true);
});

test("the row toggle is named by its own post title", async () => {
  const { container } = await mount("");
  const summary = container.querySelector("li.blog-entry summary")!;
  const id = summary.getAttribute("aria-labelledby")!;
  expect(container.querySelector(`li.blog-entry #${id}`)).toHaveTextContent(
    "Tools",
  );
  expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
});

test.each(["#%", "#%E0", "#100%"])(
  "a malformed hash (%s) is ignored without throwing",
  async (hash) => {
    const { container } = await mount(hash);
    expect(
      container.querySelector<HTMLDetailsElement>("details[data-entry]")!.open,
    ).toBe(false);
  },
);
