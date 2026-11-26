import { handleContact } from "@/lib/contact/handler";

const ENV = {
  RESEND_API_KEY: "re_test_key",
  CONTACT_TO_EMAIL: "kyle@inbox.test",
  TURNSTILE_SECRET_KEY: "ts_secret",
};
const body = {
  name: "Ada",
  email: "ada@example.com",
  company: "",
  role: "",
  message: "Hello there, Kyle.",
  token: "tok",
};

function setup(over: Partial<Parameters<typeof handleContact>[1]> = {}) {
  const deps = {
    env: { ...ENV } as Record<string, string | undefined>,
    verify: vi.fn(async () => true),
    send: vi.fn(async () => ({ ok: true as const, id: "em_1" })),
    log: vi.fn(),
    ...over,
  };
  return deps;
}

const post = (b: string, headers: Record<string, string> = {}) =>
  new Request("http://x/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: b,
  });

test("valid + verified + sent → 200 {ok:true}", async () => {
  const d = setup();
  const res = await handleContact(
    post(JSON.stringify(body), { "x-forwarded-for": "1.2.3.4, 10.0.0.1" }),
    d,
  );
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(d.verify).toHaveBeenCalledWith("tok", "ts_secret", "1.2.3.4");
  const [email, key] = vi.mocked(d.send).mock.calls[0] as unknown as [
    { to: string; reply_to: string },
    string,
  ];
  expect(key).toBe("re_test_key");
  expect(email.to).toBe("kyle@inbox.test");
  expect(email.reply_to).toBe("ada@example.com");
});

test("invalid fields → 400 with the field errors", async () => {
  const d = setup();
  const res = await handleContact(
    post(JSON.stringify({ ...body, name: "" })),
    d,
  );
  expect(res.status).toBe(400);
  expect(await res.json()).toEqual({
    ok: false,
    errors: { name: "Enter your name." },
  });
  expect(d.verify).not.toHaveBeenCalled();
});

test("bad bodies are 400", async () => {
  for (const req of [
    post("not json"),
    post(""),
    post(JSON.stringify(body), { "content-length": "20001" }),
    post(JSON.stringify({ ...body, message: "x".repeat(20_000) })),
  ]) {
    const d = setup();
    const res = await handleContact(req, d);
    expect(res.status).toBe(400);
    expect(d.send).not.toHaveBeenCalled();
  }
});

test("fake-send mode skips verify and send", async () => {
  const d = setup({ env: { CONTACT_FAKE_SEND: "1" } });
  const res = await handleContact(post(JSON.stringify(body)), d);
  expect(res.status).toBe(200);
  expect(d.verify).not.toHaveBeenCalled();
  expect(d.send).not.toHaveBeenCalled();
});

test("missing env → 500, logs names only (no values), never calls verify/send", async () => {
  const d = setup({ env: { RESEND_API_KEY: "re_test_key" } });
  const res = await handleContact(post(JSON.stringify(body)), d);
  expect(res.status).toBe(500);
  expect(d.log).toHaveBeenCalledWith(
    "contact: missing env CONTACT_TO_EMAIL, TURNSTILE_SECRET_KEY",
  );
  expect(JSON.stringify(vi.mocked(d.log).mock.calls)).not.toContain(
    "re_test_key",
  );
  expect(d.verify).not.toHaveBeenCalled();
  expect(d.send).not.toHaveBeenCalled();
});

test("turnstile false → 403, send not called", async () => {
  const d = setup({ verify: vi.fn(async () => false) });
  const res = await handleContact(post(JSON.stringify(body)), d);
  expect(res.status).toBe(403);
  expect(d.send).not.toHaveBeenCalled();
});

test("resend failure → 500", async () => {
  const d = setup({ send: vi.fn(async () => ({ ok: false as const })) });
  const res = await handleContact(post(JSON.stringify(body)), d);
  expect(res.status).toBe(500);
  expect(d.log).toHaveBeenCalledWith("contact: resend failed");
});

test("responses never contain the input or env values", async () => {
  const cases = [
    setup(),
    setup({ verify: vi.fn(async () => false) }),
    setup({ send: vi.fn(async () => ({ ok: false as const })) }),
    setup({ env: {} }),
  ];
  for (const d of cases) {
    const text = await (
      await handleContact(post(JSON.stringify(body)), d)
    ).text();
    for (const secret of [
      "ada@example.com",
      "re_test_key",
      "kyle@inbox.test",
      "ts_secret",
    ])
      expect(text).not.toContain(secret);
  }
});
