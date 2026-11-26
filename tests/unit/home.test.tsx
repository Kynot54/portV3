import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/home/hero";

export const LEAD =
  "I understand AI systems end to end. I fit them into how a business actually works. I design the system first, then build the automations and software around it.";
export const PROOF =
  "Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering";

test("hero: label, h1, lead, proof line verbatim", () => {
  render(<Hero />);
  expect(
    screen.getByText("Open to work · AI / Software Engineer"),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "I'm Kyle Whynott, an AI engineer.",
  );
  expect(
    screen.getByText(/^I understand AI systems end to end\./),
  ).toHaveTextContent(LEAD);
  expect(screen.getByText(PROOF)).toBeInTheDocument();
});

test("hero CTAs: accent Get in touch → /contact, quiet See my work → #work", () => {
  render(<Hero />);
  const primary = screen.getByRole("link", { name: "Get in touch →" });
  expect(primary).toHaveAttribute("href", "/contact");
  expect(primary.className).toContain("bg-primary");
  const secondary = screen.getByRole("link", { name: "See my work" });
  expect(secondary).toHaveAttribute("href", "#work");
  expect(secondary.className).not.toMatch(/bg-primary|text-keyword/);
});
