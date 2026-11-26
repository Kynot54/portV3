import { buildEmail } from "@/lib/contact/email";

const data = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Acme",
  role: "Engineering Manager",
  message: "Hello Kyle,\nLet's talk.",
};

test("from, to, reply_to are exact", () => {
  const e = buildEmail(data, "kyle@inbox.test");
  expect(e.from).toBe("kwhynott.dev contact <onboarding@resend.dev>");
  expect(e.to).toBe("kyle@inbox.test");
  expect(e.reply_to).toBe("ada@example.com");
});

test("subject with and without company", () => {
  expect(buildEmail(data, "k@i.t").subject).toBe(
    "Contact: Ada Lovelace (Acme)",
  );
  expect(buildEmail({ ...data, company: "" }, "k@i.t").subject).toBe(
    "Contact: Ada Lovelace",
  );
});

test("subject strips CR/LF", () => {
  const e = buildEmail(
    { ...data, name: "Bob\r\nBcc: x@y.z", company: "A\nB" },
    "k@i.t",
  );
  expect(e.subject).not.toMatch(/[\r\n]/);
});

test("text lists fields in order and omits empty optionals", () => {
  expect(buildEmail(data, "k@i.t").text).toBe(
    "Name: Ada Lovelace\nEmail: ada@example.com\nCompany: Acme\nRole: Engineering Manager\n\nHello Kyle,\nLet's talk.",
  );
  expect(buildEmail({ ...data, company: "", role: "" }, "k@i.t").text).toBe(
    "Name: Ada Lovelace\nEmail: ada@example.com\n\nHello Kyle,\nLet's talk.",
  );
});

const LS = String.fromCharCode(0x2028);
const NEL = String.fromCharCode(0x85);
const BEL = String.fromCharCode(0x07);

test("subject strips Unicode line breaks and control characters", () => {
  const e = buildEmail({ ...data, name: `Bob${LS}X${NEL}Y${BEL}Z` }, "k@i.t");
  for (const ch of [LS, NEL, BEL, "\r", "\n"])
    expect(e.subject).not.toContain(ch);
});

test("name, company and role can't add fake lines to the body", () => {
  const e = buildEmail(
    {
      ...data,
      name: "Bob\nEmail: ceo@bigco.com",
      company: "A\r\nB",
      role: `C${LS}D`,
    },
    "k@i.t",
  );
  const header = e.text.split("\n\n")[0].split("\n");
  expect(header).toEqual([
    "Name: Bob Email: ceo@bigco.com",
    "Email: ada@example.com",
    "Company: A B",
    "Role: C D",
  ]);
});
