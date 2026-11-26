import { WorkCard } from "@/components/work/work-card";
import type { WorkEntry } from "@/lib/content/types";

export function WorkList({ entries }: { entries: WorkEntry[] }) {
  return (
    <section
      aria-labelledby="work-page-title"
      className="mx-auto w-full max-w-5xl px-gutter py-section"
    >
      <h1 id="work-page-title" className="text-hero font-bold tracking-tight">
        Work
      </h1>
      <ul
        role="list"
        className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {entries.map((e) => (
          <li key={e.slug}>
            <WorkCard entry={e} headingLevel={2} />
          </li>
        ))}
      </ul>
    </section>
  );
}
