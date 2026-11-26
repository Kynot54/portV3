import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { About } from "@/components/home/about";
import { ContactCta } from "@/components/home/contact-cta";
import type { WorkEntry } from "@/lib/content/types";

/** The proof line spans several inline items; match the paragraph's full text. */
const byFullText = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === "P" && el.textContent === text;

export const LEAD =
  "I understand AI systems end to end. I fit them into how a business actually works. I design the system first, then build the automations and software around it.";
export const PROOF =
  "Taught ML at Cal State Fullerton · AI pipelines for 50+ clients · M.S. Software Engineering";

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

const entry = (
  n: number,
  label: string,
  title: string,
  summary: string,
): WorkEntry => ({
  slug: `e${n}`,
  title,
  summary,
  description: null,
  date: "2026-01",
  tags: [],
  placeholder: false,
  featured: true,
  order: n,
  label,
  role: "Role",
  location: "Remote",
  period: "Jan 2025 – Feb 2025",
  context: "Context.",
  impactHeading: "Result",
  impact: ["Result."],
  learned: "Learned.",
  tools: ["Tool"],
  body: "",
});
const FIXTURE_THREE = [
  entry(
    1,
    "AI · 2025–26",
    "AI document pipelines",
    "I built AI pipelines for 50+ clients. Manual review dropped 50%.",
  ),
  entry(
    2,
    "Web · 2024–25",
    "C.O.N.T.R.O.L. BH",
    "I built and maintained a nonprofit web app for 1,000+ users. Donations rose 40%.",
  ),
  entry(
    3,
    "AI · Mobile · 2025–26",
    "Ulti-Health",
    "I built a wellness app that plans workouts and meals from the user's own data.",
  ),
];
const ABOUT =
  "I grew up with analog, came of age with digital, and adapted and evolved with AI. I've lived with all three, so I can explain each one plainly and connect them. I designed and taught a machine learning course to 40+ students at Cal State Fullerton, and I've taught C++ from object-oriented design up to data structures.";
const CONTACT =
  "I'm looking for my next role as an AI or software engineer. Let's talk.";

test("SelectedWork renders one linked card per entry with label, title, summary", () => {
  render(<SelectedWork entries={FIXTURE_THREE} />);
  expect(
    screen.getByRole("heading", { level: 2, name: "Selected work" }),
  ).toBeInTheDocument();
  const cards = screen.getAllByRole("link");
  expect(cards).toHaveLength(3);
  cards.forEach((c, i) => expect(c).toHaveAttribute("href", `/work/e${i + 1}`));
  expect(cards[0]).toHaveTextContent("AI · 2025–26");
  expect(cards[0]).toHaveTextContent("AI document pipelines");
  expect(cards[1]).toHaveTextContent(FIXTURE_THREE[1].summary);
  expect(document.getElementById("work")).not.toBeNull();
});

test("About and Contact copy verbatim; Contact CTA is accent → /contact", () => {
  render(
    <>
      <About />
      <ContactCta />
    </>,
  );
  expect(
    screen.getByRole("heading", { level: 2, name: "About" }),
  ).toBeInTheDocument();
  expect(screen.getByText(byFullText(ABOUT))).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 2, name: "Contact" }),
  ).toBeInTheDocument();
  expect(screen.getByText(byFullText(CONTACT))).toBeInTheDocument();
  const cta = screen.getByRole("link", { name: "Get in touch →" });
  expect(cta).toHaveAttribute("href", "/contact");
  expect(cta.className).toContain("bg-primary");
});

test("no generational label anywhere on Home", () => {
  const { container } = render(
    <>
      <Hero />
      <SelectedWork entries={FIXTURE_THREE} />
      <About />
      <ContactCta />
    </>,
  );
  expect(container.textContent).not.toMatch(
    /zillennial|millennial|gen ?z|generation/i,
  );
});

test("project titles are h3 headings inside a list", () => {
  render(<SelectedWork entries={FIXTURE_THREE} />);
  expect(
    screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
  ).toEqual(["AI document pipelines", "C.O.N.T.R.O.L. BH", "Ulti-Health"]);
  expect(screen.getByRole("list")).toHaveAttribute("role", "list");
});
