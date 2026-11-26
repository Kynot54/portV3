import { render, screen, within } from "@testing-library/react";
import { WorkList } from "@/components/work/work-list";
import { WorkCard } from "@/components/work/work-card";
import { getWorkList } from "@/lib/content/load";

test("WorkCard links to its page and uses the requested heading level", async () => {
  const [first] = await getWorkList();
  const { rerender } = render(<WorkCard entry={first} headingLevel={2} />);
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "/work/ai-document-pipelines",
  );
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "AI document pipelines",
  );
  rerender(<WorkCard entry={first} headingLevel={3} />);
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "AI document pipelines",
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
    "/work/ai-document-pipelines",
    "/work/control-bh",
    "/work/ulti-health",
    "/work/video-interview-plugin",
    "/work/ai-mind-companion",
  ]);
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
});
