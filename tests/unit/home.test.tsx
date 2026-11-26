import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/home/hero";

/** The proof line spans several inline items; match the paragraph's full text. */
const byFullText = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === "P" && el.textContent === text;

export const LEAD =
  "I understand AI systems end to end. I fit them into how a business actually works. I design the system first, then build the automations and software around it.";
export const PROOF =
  "Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S. Software Engineering";

test("hero: label, h1, lead, proof line verbatim", () => {
  render(<Hero />);
  expect(
    screen.getByText(byFullText("Open to work · AI / Software Engineer")),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "I'm Kyle Whynott, an AI engineer.",
  );
  expect(
    screen.getByText(/^I understand AI systems end to end\./),
  ).toHaveTextContent(LEAD);
  expect(screen.getByText(byFullText(PROOF))).toBeInTheDocument();
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

test("visual is decorative: aria-hidden, nothing focusable, sits after the proof line", () => {
  const { container } = render(<Hero />);
  const v = container.querySelector(".three-eras");
  expect(v).not.toBeNull();
  expect(v).toHaveAttribute("aria-hidden", "true");
  expect(v!.querySelectorAll("a,button,[tabindex]").length).toBe(0);
  const proof = screen.getByText(byFullText(PROOF));
  expect(
    proof.compareDocumentPosition(v!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
