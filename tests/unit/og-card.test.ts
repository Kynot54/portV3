import { HOME_CARD_TITLE, cardAlt } from "@/lib/og-card";

test("card alt drops the title's end punctuation before the name (Kyle, 2026-11-27)", () => {
  expect(cardAlt(HOME_CARD_TITLE)).toBe(
    "I'm Kyle Whynott, an AI engineer, Kyle Whynott",
  );
  expect(cardAlt("Is it fast?")).toBe("Is it fast, Kyle Whynott");
});

test("card alt keeps a title without end punctuation as is", () => {
  expect(cardAlt("Work")).toBe("Work, Kyle Whynott");
  expect(cardAlt("C.O.N.T.R.O.L. BH")).toBe("C.O.N.T.R.O.L. BH, Kyle Whynott");
});
