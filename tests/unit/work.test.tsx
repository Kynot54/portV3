import { render, screen, within } from "@testing-library/react";
import { WorkList } from "@/components/work/work-list";
import { WorkCard } from "@/components/work/work-card";
import { getWorkList } from "@/lib/content/load";

test("WorkCard links to its page and uses the requested heading level", async () => {
  const [first] = await getWorkList();
  const { rerender } = render(<WorkCard entry={first} headingLevel={2} />);
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "/work/working-entrepreneurs",
  );
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Working Entrepreneurs",
  );
  rerender(<WorkCard entry={first} headingLevel={3} />);
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "Working Entrepreneurs",
  );
});

test("/work list: h1 Work, five cards in order, h2 titles, list role", async () => {
  render(<WorkList entries={await getWorkList()} />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Work" }),
  ).toBeInTheDocument();
  const list = screen.getByRole("list");
  const links = within(list).getAllByRole("link");
  expect(links.map((l) => l.getAttribute("href"))).toEqual([
    "/work/working-entrepreneurs",
    "/work/control-bh",
    "/work/ulti-health",
    "/work/video-interview-plugin",
    "/work/ai-mind-companion",
  ]);
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
});

import { MediaPlaceholder } from "@/components/work/media-placeholder";

test("MediaPlaceholder: readable label, decorative layer hidden, nothing focusable", () => {
  const { container } = render(<MediaPlaceholder />);
  expect(screen.getByText("Preview coming soon")).toBeInTheDocument();
  expect(container.querySelector("[data-grain]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  expect(container.querySelectorAll("a,button,[tabindex]").length).toBe(0);
});
