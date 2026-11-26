import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact/contact-form";
import { loadScript } from "@/lib/load-script";

vi.mock("@/lib/load-script", () => ({ loadScript: vi.fn(async () => {}) }));

const turnstile = {
  render: vi.fn((_el: HTMLElement, o: { callback: (t: string) => void }) => {
    o.callback("tok-1");
    return "w1";
  }),
  reset: vi.fn(),
};

const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(window, { turnstile });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const ok = (status = 200, body: object = { ok: true }) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ada");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Company (optional)"), "Acme");
  await user.type(screen.getByLabelText("Your role (optional)"), "EM");
  await user.type(screen.getByLabelText("Message"), "Hello there, Kyle.");
}

test("labels and fields render with the exact copy", () => {
  render(<ContactForm siteKey="site" />);
  for (const label of [
    "Name",
    "Email",
    "Company (optional)",
    "Your role (optional)",
    "Message",
  ])
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Send message" }),
  ).toBeInTheDocument();
});

test("invalid submit shows exact errors and focuses the first invalid field; no fetch", async () => {
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await user.type(screen.getByLabelText("Email"), "nope");
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(screen.getByText("Enter your name.")).toBeInTheDocument();
  expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  expect(
    screen.getByText("Write a message of at least 10 characters."),
  ).toBeInTheDocument();
  const name = screen.getByLabelText("Name");
  expect(name).toHaveFocus();
  expect(name).toHaveAttribute("aria-invalid", "true");
  expect(name).toHaveAccessibleDescription("Enter your name.");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("Turnstile loads on first focus, not on render", async () => {
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  expect(loadScript).not.toHaveBeenCalled();
  await user.click(screen.getByLabelText("Name"));
  await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1));
  expect(vi.mocked(loadScript).mock.calls[0][0]).toBe(
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  );
  const opts = turnstile.render.mock.calls[0][1] as unknown as Record<
    string,
    unknown
  >;
  expect(opts).toMatchObject({
    sitekey: "site",
    appearance: "interaction-only",
    size: "flexible",
  });
  await user.click(screen.getByLabelText("Email"));
  expect(loadScript).toHaveBeenCalledTimes(1);
});

test("valid submit posts fields + token and shows the sent line; fields clear", async () => {
  fetchMock.mockImplementation(() => ok());
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(
    await screen.findByText(
      "Thanks, your message is on its way. I reply within 2–3 business days.",
    ),
  ).toHaveAttribute("role", "status");
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/contact");
  expect(JSON.parse(init.body)).toEqual({
    name: "Ada",
    email: "ada@example.com",
    company: "Acme",
    role: "EM",
    message: "Hello there, Kyle.",
    token: "tok-1",
  });
  expect(screen.getByLabelText("Name")).toHaveValue("");
  expect(screen.getByLabelText("Message")).toHaveValue("");
});

test("a second click while sending is ignored", async () => {
  let resolve!: (r: Response) => void;
  fetchMock.mockImplementation(
    () => new Promise<Response>((r) => (resolve = r)),
  );
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  const button = screen.getByRole("button", { name: "Send message" });
  await user.click(button);
  expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Sending…" }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  resolve(new Response(JSON.stringify({ ok: true })));
  await screen.findByRole("status");
});

test("failure resets Turnstile", async () => {
  fetchMock.mockImplementation(() => ok(500, { ok: false }));
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Something went wrong. Try again, or book a call instead.",
  );
  expect(turnstile.reset).toHaveBeenCalledWith("w1");
  expect(screen.getByLabelText("Name")).toHaveValue("Ada");
});

test("server 400 errors are shown per field", async () => {
  fetchMock.mockImplementation(() =>
    ok(400, { ok: false, errors: { email: "Enter a valid email address." } }),
  );
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(
    await screen.findByText("Enter a valid email address."),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("missing siteKey → failure line, no fetch", async () => {
  const user = userEvent.setup();
  render(<ContactForm siteKey={undefined} />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Something went wrong.",
  );
  expect(fetchMock).not.toHaveBeenCalled();
  expect(loadScript).not.toHaveBeenCalled();
});
