import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Booking } from "@/components/contact/booking";
import { loadScript } from "@/lib/load-script";

vi.mock("@/lib/load-script", () => ({ loadScript: vi.fn(async () => {}) }));

type CalFn = ((...args: unknown[]) => void) & { mock: { calls: unknown[][] } };
let Cal: CalFn;
beforeEach(() => {
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
  // The real embed adds an iframe for "inline"; this one does too.
  Cal = vi.fn((cmd: unknown, opts: unknown) => {
    if (cmd === "inline") {
      const target = (opts as { elementOrSelector: HTMLElement })
        .elementOrSelector;
      target.append(document.createElement("iframe"));
    }
  }) as unknown as CalFn;
  Object.assign(window, { Cal });
});

function renderBooking(
  calLink: string | undefined = "kyle/30min",
  timeoutMs?: number,
) {
  return render(
    <>
      <Booking calLink={calLink} timeoutMs={timeoutMs} />
      <div id="booking-calendar" />
    </>,
  );
}

test("no script before click", () => {
  renderBooking();
  expect(screen.getByText("A 30-minute intro call.")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Book a call" }),
  ).toBeInTheDocument();
  expect(loadScript).not.toHaveBeenCalled();
});

test("click loads embed.js and calls Cal init/inline with the link", async () => {
  const user = userEvent.setup();
  renderBooking();
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  expect(loadScript).toHaveBeenCalledWith("https://app.cal.com/embed/embed.js");
  expect(Cal.mock.calls[0]).toEqual(["init", { origin: "https://cal.com" }]);
  const inline = Cal.mock.calls.find((c) => c[0] === "inline")!;
  expect(inline[1]).toMatchObject({ calLink: "kyle/30min" });
});

test("the calendar region is focused, labelled, and rendered in the full-width target", async () => {
  const user = userEvent.setup();
  renderBooking();
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  const region = await screen.findByRole("region", {
    name: "Booking calendar",
  });
  expect(region).toHaveFocus();
  expect(region.parentElement).toHaveAttribute("id", "booking-calendar");
});

test("script error → Open the booking page with the right href", async () => {
  vi.mocked(loadScript).mockRejectedValueOnce(new Error("blocked"));
  const user = userEvent.setup();
  renderBooking();
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  const link = await screen.findByRole("link", {
    name: "Open the booking page",
  });
  expect(link).toHaveAttribute("href", "https://cal.com/kyle/30min");
  expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
});

test("no calendar iframe within the timeout → Open the booking page", async () => {
  Cal = vi.fn() as unknown as CalFn; // never renders
  Object.assign(window, { Cal });
  const user = userEvent.setup();
  renderBooking("kyle/30min", 50);
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  expect(
    await screen.findByRole("link", { name: "Open the booking page" }),
  ).toBeInTheDocument();
});

test("no calLink → no button, no link", () => {
  render(<Booking calLink={undefined} />);
  expect(screen.getByText("A 30-minute intro call.")).toBeInTheDocument();
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.queryByRole("link")).toBeNull();
});

test("layout goes inside config, as in Cal.com's inline snippet", async () => {
  const user = userEvent.setup();
  renderBooking();
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  const inline = Cal.mock.calls.find((c) => c[0] === "inline")!;
  expect(inline[1]).toMatchObject({ config: { layout: "month_view" } });
});

test("on failure the empty calendar region goes away and the link takes focus", async () => {
  vi.mocked(loadScript).mockRejectedValueOnce(new Error("blocked"));
  const user = userEvent.setup();
  renderBooking();
  await user.click(screen.getByRole("button", { name: "Book a call" }));
  const link = await screen.findByRole("link", {
    name: "Open the booking page",
  });
  expect(screen.queryByRole("region", { name: "Booking calendar" })).toBeNull();
  expect(link).toHaveFocus();
});

const SERVICES = {
  intro: "A free 30-minute consultation.",
  label: "Book a consultation",
};

test("intro and button label can be set (Services)", () => {
  render(<Booking calLink="kyle/consultation" {...SERVICES} />);
  expect(screen.getByText(SERVICES.intro)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Book a consultation" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("A 30-minute intro call.")).toBeNull();
});

test("Services labels with no link: the intro, no button, no error", () => {
  render(<Booking calLink={undefined} {...SERVICES} />);
  expect(screen.getByText(SERVICES.intro)).toBeInTheDocument();
  expect(screen.queryByRole("button")).toBeNull();
});
