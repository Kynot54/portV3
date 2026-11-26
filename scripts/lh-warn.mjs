// Prints a warning for any median Lighthouse category score below the 0.99
// target. The hard 0.95 / 1.0 floors are enforced by lighthouserc.json.
import { readFileSync } from "node:fs";

const TARGET = 0.99;
const manifest = JSON.parse(
  readFileSync(".lighthouseci/manifest.json", "utf8"),
);
const rows = manifest.filter((r) => r.isRepresentativeRun);
let warned = 0;

for (const { url, summary } of rows) {
  const path = new URL(url).pathname;
  const scores = Object.entries(summary)
    .map(([k, v]) => `${k} ${Math.round(v * 100)}`)
    .join(", ");
  console.log(`${path.padEnd(10)} ${scores}`);
  for (const [category, score] of Object.entries(summary)) {
    if (score < TARGET) {
      warned++;
      console.log(
        `::warning title=Lighthouse below target::${path} ${category} ${score} < ${TARGET}`,
      );
    }
  }
}
console.log(
  warned
    ? `${warned} score(s) below the ${TARGET} target.`
    : `All scores ≥ ${TARGET}.`,
);
