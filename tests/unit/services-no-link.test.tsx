import { render, screen } from "@testing-library/react";
import ServicesPage from "@/app/services/page";

// A local build with Services on but no consultation link (production can't build this way).
vi.hoisted(() => {
  delete process.env.NEXT_PUBLIC_CAL_CONSULT_LINK;
});

beforeEach(() => {
  process.env.SERVICES_ENABLED = "true";
});
afterEach(() => {
  delete process.env.SERVICES_ENABLED;
});

test("without a consultation link the hero offers no dead-end booking link", () => {
  render(<ServicesPage />);
  expect(
    screen.queryByRole("link", { name: "Book a consultation" }),
  ).toBeNull();
  expect(screen.getByRole("link", { name: "Send a message" })).toHaveAttribute(
    "href",
    "#message",
  );
});
