const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-26" → "Nov 26, 2026", read as a calendar date (no timezone shift). */
export function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return fmt.format(Date.UTC(y, m - 1, d));
}
