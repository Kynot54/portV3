import { validateContact } from "@/lib/contact/validate";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  company: "",
  role: "",
  message: "Hello there, Kyle.",
};

test("accepts a minimal valid message", () => {
  expect(validateContact(valid)).toEqual({ ok: true, data: valid });
});

test("trims every field", () => {
  const r = validateContact({
    name: "  Ada ",
    email: " ada@example.com ",
    company: " Acme ",
    role: " EM ",
    message: "  Hello there, Kyle.  ",
  });
  expect(r).toEqual({
    ok: true,
    data: {
      name: "Ada",
      email: "ada@example.com",
      company: "Acme",
      role: "EM",
      message: "Hello there, Kyle.",
    },
  });
});

test("required errors use the exact copy", () => {
  const r = validateContact({ name: " ", email: "", message: "123456789" });
  expect(r).toEqual({
    ok: false,
    errors: {
      name: "Enter your name.",
      email: "Enter a valid email address.",
      message: "Write a message of at least 10 characters.",
    },
  });
});

test("max lengths", () => {
  const r = validateContact({
    ...valid,
    name: "a".repeat(101),
    company: "c".repeat(101),
    role: "r".repeat(101),
    message: "m".repeat(5001),
  });
  expect(r).toEqual({
    ok: false,
    errors: {
      name: "Keep this under 100 characters.",
      company: "Keep this under 100 characters.",
      role: "Keep this under 100 characters.",
      message: "Keep this under 5000 characters.",
    },
  });
});

test("optional company and role may be empty or missing", () => {
  const { company, role, ...rest } = valid;
  void company;
  void role;
  expect(validateContact(rest)).toEqual({ ok: true, data: valid });
});

test.each([
  "a@b.c\r\nBcc: z@z.z",
  "a@b",
  "x@y",
  "a b@c.de",
  `${"a".repeat(250)}@b.co`,
])("rejects header-injection and overlong emails: %j", (email) => {
  const r = validateContact({ ...valid, email });
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.errors.email).toBe("Enter a valid email address.");
});

test("non-object input → errors for name, email, message", () => {
  for (const raw of [null, "x", 42, []]) {
    const r = validateContact(raw);
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(Object.keys(r.errors).sort()).toEqual([
        "email",
        "message",
        "name",
      ]);
  }
});

test("non-string field values are treated as empty", () => {
  const r = validateContact({ ...valid, name: 42 });
  expect(r.ok).toBe(false);
});

test.each([
  "kyle@gmail.com,",
  "a@b.co>",
  "<a@b.co",
  "a@b..co",
  "a@b.co;",
  '"a@b.co"',
  "a..b@c.co",
  ".a@b.co",
])("rejects addresses Resend would refuse as reply-to: %j", (email) => {
  const r = validateContact({ ...valid, email });
  expect(r.ok).toBe(false);
});

test("accepts ordinary real-world addresses", () => {
  for (const email of [
    "first.last+tag@sub.example.co.uk",
    "o'neil@acme.io",
    "a_b-c@x-y.com",
  ])
    expect(validateContact({ ...valid, email }).ok, email).toBe(true);
});
