import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ContactCta } from "@/components/home/contact-cta";
import { ServicesLinkLine } from "@/components/services-link-line";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/") }));

afterEach(() => {
  delete process.env.SERVICES_ENABLED;
});

const servicesLinks = () =>
  screen
    .queryAllByRole("link")
    .filter((a) => a.getAttribute("href") === "/services");

test("on: footer, Home's contact section and the link line point to /services", () => {
  process.env.SERVICES_ENABLED = "true";
  render(<Footer />);
  expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
    "href",
    "/services",
  );
});

test("on: Home's contact section has the link line", () => {
  process.env.SERVICES_ENABLED = "true";
  render(<ContactCta />);
  expect(
    screen.getByText("Run a business and need software built?", {
      exact: false,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "See what I offer" }),
  ).toHaveAttribute("href", "/services");
});

test("off: no Services link anywhere", () => {
  render(
    <>
      <Footer />
      <ContactCta />
      <ServicesLinkLine />
    </>,
  );
  expect(servicesLinks()).toHaveLength(0);
  expect(
    screen.queryByText("Run a business and need software built?", {
      exact: false,
    }),
  ).toBeNull();
});

test("on: the header nav never has Services (placement B)", () => {
  process.env.SERVICES_ENABLED = "true";
  render(<Header showBlog />);
  expect(
    screen
      .getByRole("navigation", { name: "Main" })
      .querySelector('a[href="/services"]'),
  ).toBeNull();
});
