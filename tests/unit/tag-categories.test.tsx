import { render, screen } from "@testing-library/react";
import { TagList } from "@/components/blog/post-meta";
import { tagCategory } from "@/lib/tag-categories";

test.each([
  ["llm", "ai"],
  ["RAG", "ai"],
  ["typescript", "engineering"],
  ["teaching", "career"],
  ["hr", "business"],
  ["accounting", "business"],
  ["til", "notes"],
])("tag %s → %s", (tag, category) => {
  expect(tagCategory(tag)).toBe(category);
});

test("unknown tags have no category", () => {
  expect(tagCategory("gardening")).toBeNull();
});

test("TagList marks each chip with its category, unknown ones stay plain", () => {
  render(<TagList tags={["llm", "hr", "gardening"]} />);
  const [ai, business, plain] = screen.getAllByRole("listitem");
  expect(ai).toHaveAttribute("data-category", "ai");
  expect(business).toHaveAttribute("data-category", "business");
  expect(plain).not.toHaveAttribute("data-category");
  // The grey utility would outrank the category colour, so only plain chips get it.
  expect(ai).not.toHaveClass("text-muted-foreground");
  expect(plain).toHaveClass("text-muted-foreground");
});
