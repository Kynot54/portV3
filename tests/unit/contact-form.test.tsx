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
    source: "contact",
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
  // Disabled for interaction, but still focusable (aria-disabled, not the native attribute).
  expect(screen.getByRole("button", { name: "Sending…" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
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

test("each field shows an example placeholder", () => {
  render(<ContactForm siteKey="site" />);
  const expected: Record<string, string> = {
    Name: "Jane Smith",
    Email: "jane@company.com",
    "Company (optional)": "Acme Inc.",
    "Your role (optional)": "Engineering Manager",
    Message:
      "Hi Kyle, we're hiring a software engineer and I'd like to talk about the role.",
  };
  for (const [label, placeholder] of Object.entries(expected)) {
    const el = screen.getByLabelText(label);
    expect(el).toHaveAttribute("placeholder", placeholder);
    // The label, not the placeholder, names the field.
    expect(el).toHaveAccessibleName(label);
  }
});

test("waits for a Turnstile token that arrives late, then sends it", async () => {
  let opts!: { callback: (t: string) => void };
  turnstile.render.mockImplementationOnce((_el, o) => {
    opts = o;
    return "w1";
  });
  fetchMock.mockImplementation(() => ok());
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(fetchMock).not.toHaveBeenCalled();
  opts.callback("late-token");
  await screen.findByText(/Thanks, your message is on its way/);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).token).toBe("late-token");
});

test("no token within the wait → failure line, nothing posted", async () => {
  turnstile.render.mockImplementationOnce(() => "w1");
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" tokenTimeoutMs={50} />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Something went wrong.",
  );
  expect(fetchMock).not.toHaveBeenCalled();
});

test("a success resets Turnstile so a second message gets a fresh token", async () => {
  fetchMock.mockImplementation(() => ok());
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText(/Thanks, your message is on its way/);
  expect(turnstile.reset).toHaveBeenCalledWith("w1");
});

test("the button stays focusable while sending (focus isn't dropped)", async () => {
  fetchMock.mockImplementation(() => new Promise(() => {}));
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  const button = screen.getByRole("button", { name: "Sending…" });
  expect(button).not.toHaveAttribute("disabled");
  expect(button).toHaveAttribute("aria-disabled", "true");
});

test('source="services" is sent with the message', async () => {
  fetchMock.mockImplementation(() => ok());
  const user = userEvent.setup();
  render(<ContactForm siteKey="site" source="services" />);
  await fillValid(user);
  await user.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByRole("status");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).source).toBe("services");
});

test("on Services, the role and message examples fit a founder", () => {
  render(<ContactForm siteKey="site" source="services" />);
  expect(screen.getByLabelText("Your role (optional)")).toHaveAttribute(
    "placeholder",
    "Owner",
  );
  expect(screen.getByLabelText("Message")).toHaveAttribute(
    "placeholder",
    "Hi Kyle, I run a small business and I'd like a website where customers can request a quote online.",
  );
  // Name, email and company examples are shared.
  expect(screen.getByLabelText("Company (optional)")).toHaveAttribute(
    "placeholder",
    "Acme Inc.",
  );
});
