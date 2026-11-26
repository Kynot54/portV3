import { verifyTurnstile } from "@/lib/contact/turnstile";
import { sendEmail } from "@/lib/contact/resend";
import { isFakeSend, missingServerEnv } from "@/lib/contact/config";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

test("verifyTurnstile posts secret, response, remoteip to siteverify", async () => {
  const f = vi.fn(async () => json({ success: true }));
  expect(await verifyTurnstile("tok", "sec", "1.2.3.4", f)).toBe(true);
  const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
  expect(init.method).toBe("POST");
  const body = init.body as FormData;
  expect(body.get("secret")).toBe("sec");
  expect(body.get("response")).toBe("tok");
  expect(body.get("remoteip")).toBe("1.2.3.4");
});

test("verifyTurnstile is false on success:false, non-200, throw, empty token (no fetch)", async () => {
  expect(
    await verifyTurnstile("t", "s", null, async () => json({ success: false })),
  ).toBe(false);
  expect(
    await verifyTurnstile("t", "s", null, async () =>
      json({ success: true }, 500),
    ),
  ).toBe(false);
  expect(
    await verifyTurnstile("t", "s", null, async () => {
      throw new Error("down");
    }),
  ).toBe(false);
  const f = vi.fn();
  expect(await verifyTurnstile("", "s", null, f)).toBe(false);
  expect(f).not.toHaveBeenCalled();
});

const email = {
  from: "f",
  to: "t@x.y",
  reply_to: "r@x.y",
  subject: "s",
  text: "body",
};

test("sendEmail sends bearer auth and the JSON body", async () => {
  const f = vi.fn(async () => json({ id: "em_1" }));
  expect(await sendEmail(email, "re_key", f)).toEqual({ ok: true, id: "em_1" });
  const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.resend.com/emails");
  expect(init.method).toBe("POST");
  expect(new Headers(init.headers).get("Authorization")).toBe("Bearer re_key");
  expect(new Headers(init.headers).get("Content-Type")).toBe(
    "application/json",
  );
  expect(JSON.parse(init.body as string)).toEqual(email);
});

test("sendEmail → ok:false on 4xx/5xx or throw", async () => {
  expect(
    await sendEmail(email, "k", async () => json({ message: "no" }, 403)),
  ).toEqual({ ok: false });
  expect(await sendEmail(email, "k", async () => json({}, 500))).toEqual({
    ok: false,
  });
  expect(
    await sendEmail(email, "k", async () => {
      throw new Error("down");
    }),
  ).toEqual({ ok: false });
});

test("missingServerEnv names exactly the missing/blank vars", () => {
  expect(missingServerEnv({})).toEqual([
    "RESEND_API_KEY",
    "CONTACT_TO_EMAIL",
    "TURNSTILE_SECRET_KEY",
  ]);
  expect(
    missingServerEnv({
      RESEND_API_KEY: "re_x",
      CONTACT_TO_EMAIL: " ",
      TURNSTILE_SECRET_KEY: "s",
    }),
  ).toEqual(["CONTACT_TO_EMAIL"]);
});

test("isFakeSend is ignored in production", () => {
  expect(isFakeSend({ CONTACT_FAKE_SEND: "1" })).toBe(true);
  expect(isFakeSend({ CONTACT_FAKE_SEND: "1", VERCEL_ENV: "preview" })).toBe(
    true,
  );
  expect(isFakeSend({ CONTACT_FAKE_SEND: "1", VERCEL_ENV: "production" })).toBe(
    false,
  );
  expect(isFakeSend({})).toBe(false);
});
