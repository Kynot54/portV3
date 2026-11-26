import { formatDate } from "@/lib/format-date";

test("formats YYYY-MM-DD as a short US date", () => {
  expect(formatDate("2026-11-26")).toBe("Nov 26, 2026");
  expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
});

test("never shifts the day for timezones west of UTC", () => {
  const tz = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  try {
    expect(formatDate("2026-03-01")).toBe("Mar 1, 2026");
  } finally {
    process.env.TZ = tz;
  }
});
