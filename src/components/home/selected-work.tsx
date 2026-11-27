import { WorkCard } from "@/components/work/work-card";
import type { WorkEntry } from "@/lib/content/types";

export function SelectedWork({ entries }: { entries: WorkEntry[] }) {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="mx-auto w-full max-w-5xl px-gutter py-section"
    >
      <h2 id="work-title" className="text-h2 font-bold tracking-tight">
        Selected Work
      </h2>
      <ul role="list" className="mt-8 grid gap-4 md:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug}>
            <WorkCard entry={e} headingLevel={3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
