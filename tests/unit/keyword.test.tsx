import { render, screen } from "@testing-library/react";
import { Keyword } from "@/components/keyword";

test("Keyword renders a blue span, not a link", () => {
  render(
    <p>
      I work with <Keyword>LLMs</Keyword> daily.
    </p>,
  );
  const el = screen.getByText("LLMs");
  expect(el.tagName).toBe("SPAN");
  expect(el).toHaveClass("text-keyword");
  expect(screen.queryByRole("link")).toBeNull();
});
