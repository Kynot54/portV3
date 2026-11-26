import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { setMinWidth640 } from "../support/match-media";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/") }));
const pathname = vi.mocked(usePathname);

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>,
  );
}

/** Accessible names of visible links/buttons in the main nav, in DOM order. */
function navOrder() {
  const nav = screen.getByRole("navigation", { name: "Main" });
  return [...nav.querySelectorAll<HTMLElement>("a, button")]
    .filter((el) => !el.closest("[hidden]"))
    .map((el) => el.getAttribute("aria-label") ?? el.textContent?.trim());
}

beforeEach(() => pathname.mockReturnValue("/"));

test('logo shows KW and is named "Kyle Whynott, home", linking to /', () => {
  renderHeader();
  const logo = screen.getByRole("link", { name: "Kyle Whynott, home" });
  expect(logo).toHaveTextContent("KW");
  expect(logo).toHaveAttribute("href", "/");
});

test("desktop nav: logo, Work, Blog, theme toggle, Contact, then Menu (mobile)", async () => {
  renderHeader();
  await screen.findByRole("button", { name: /^Theme: / });
  const order = navOrder();
  expect(order.slice(0, 3)).toEqual(["Kyle Whynott, home", "Work", "Blog"]);
  expect(order[3]).toMatch(/^Theme: /);
  expect(order.slice(4)).toEqual(["Contact", "Menu"]);
});

test("marks current section, including nested paths", () => {
  pathname.mockReturnValue("/blog/some-post");
  renderHeader();
  const nav = screen.getByRole("navigation", { name: "Main" });
  expect(within(nav).getByRole("link", { name: "Blog" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(within(nav).getByRole("link", { name: "Work" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("Contact uses the accent button style", () => {
  renderHeader();
  const contact = screen.getByRole("link", { name: "Contact" });
  expect(contact).toHaveAttribute("href", "/contact");
  expect(contact.className).toContain("bg-primary");
  expect(contact.className).toContain("rounded-full");
});

test("menu button toggles aria-expanded and controls #mobile-menu", async () => {
  renderHeader();
  const btn = screen.getByRole("button", { name: "Menu" });
  expect(btn).toHaveAttribute("aria-controls", "mobile-menu");
  expect(btn).toHaveAttribute("aria-expanded", "false");
  expect(document.getElementById("mobile-menu")).not.toBeVisible();
  await userEvent.click(btn);
  expect(btn).toHaveAttribute("aria-expanded", "true");
  const panel = document.getElementById("mobile-menu")!;
  expect(panel).toBeVisible();
  expect(within(panel).getByRole("link", { name: "Work" })).toBeInTheDocument();
  expect(within(panel).getByRole("link", { name: "Blog" })).toBeInTheDocument();
  expect(
    await within(panel).findByRole("button", { name: /^Theme: / }),
  ).toBeInTheDocument();
});

test("Escape closes the menu and returns focus to the button", async () => {
  renderHeader();
  const btn = screen.getByRole("button", { name: "Menu" });
  await userEvent.click(btn);
  await userEvent.keyboard("{Tab}");
  await userEvent.keyboard("{Escape}");
  expect(btn).toHaveAttribute("aria-expanded", "false");
  expect(btn).toHaveFocus();
});

test("clicking a menu link closes the menu", async () => {
  renderHeader();
  const btn = screen.getByRole("button", { name: "Menu" });
  await userEvent.click(btn);
  const panel = document.getElementById("mobile-menu")!;
  await userEvent.click(within(panel).getByRole("link", { name: "Work" }));
  expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("route change closes the menu", async () => {
  const { rerender } = renderHeader();
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  pathname.mockReturnValue("/work");
  rerender(
    <ThemeProvider>
      <Header />
    </ThemeProvider>,
  );
  expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("menu closes when viewport crosses to desktop", async () => {
  renderHeader();
  await userEvent.click(screen.getByRole("button", { name: "Menu" }));
  act(() => setMinWidth640(true));
  expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("footer shows © Kyle Whynott with GitHub and LinkedIn links", () => {
  render(<Footer />);
  expect(screen.getByRole("contentinfo")).toHaveTextContent("© Kyle Whynott");
  expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/Kynot54",
  );
  expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/kyle-whynott",
  );
});
