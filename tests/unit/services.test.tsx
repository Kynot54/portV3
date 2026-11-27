import { render, screen, within } from "@testing-library/react";
import { notFound } from "next/navigation";
import ServicesPage, { generateMetadata } from "@/app/services/page";
import { SERVICES_COPY } from "@/lib/services-copy";

// Read when the page module loads, as at build time.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_CAL_CONSULT_LINK = "kyle/consultation";
});

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SERVICES_ENABLED = "true";
});
afterEach(() => {
  delete process.env.SERVICES_ENABLED;
});

test("the approved headline, three offers, training, three projects, four steps", () => {
  render(<ServicesPage />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Software for your business, built around how it works.",
  );
  for (const title of [
    "Websites",
    "Custom software",
    "AI that takes on repetitive work",
  ])
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Teaching your team" }),
  ).toBeInTheDocument();
  for (const slug of [
    "control-bh",
    "video-interview-plugin",
    "working-entrepreneurs",
  ])
    expect(
      document.querySelector(`a[href="/work/${slug}"]`),
      slug,
    ).not.toBeNull();
  expect(
    within(screen.getByRole("list", { name: "How it works" })).getAllByRole(
      "listitem",
    ),
  ).toHaveLength(4);
  expect(
    screen.getByRole("button", { name: "Book a consultation" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("A free 30-minute consultation."),
  ).toBeInTheDocument();
});

test("step 4 states Kyle's handover and maintenance terms", () => {
  expect(SERVICES_COPY.steps[3]).toEqual({
    title: "Handover and support.",
    text: "I train your team on the finished product and transfer full ownership to your business, including the hosting and service accounts and their costs. After launch, I provide ongoing maintenance at a monthly rate until you hire someone to take it over.",
  });
});

test("the booking button on Services uses the call-to-action colour", () => {
  render(<ServicesPage />);
  expect(
    screen.getByRole("button", { name: "Book a consultation" }),
  ).toHaveClass("accent-glow");
});

test("off: the page 404s and has no canonical", async () => {
  delete process.env.SERVICES_ENABLED;
  expect(() => render(<ServicesPage />)).toThrow("NEXT_NOT_FOUND");
  expect(notFound).toHaveBeenCalled();
  expect((await generateMetadata()).alternates).toBeUndefined();
});

test("on: canonical and description for /services", async () => {
  const m = await generateMetadata();
  expect(m.alternates?.canonical).toBe("https://kwhynott.dev/services");
  expect(m.title).toBe("Services");
});

test("off: the preview card 404s too", async () => {
  delete process.env.SERVICES_ENABLED;
  const { default: Card } = await import("@/app/services/opengraph-image");
  expect(() => Card()).toThrow("NEXT_NOT_FOUND");
});
