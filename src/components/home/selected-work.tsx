import Link from "next/link";
import type { WorkEntry } from "@/lib/content/types";

export function SelectedWork({ entries }: { entries: WorkEntry[] }) {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="mx-auto w-full max-w-5xl px-gutter py-section"
    >
      <h2 id="work-title" className="text-h2 font-bold tracking-tight">
        Selected work
      </h2>
      <ul role="list" className="mt-8 grid gap-4 md:grid-cols-3">
        {entries.map((e) => (
          <li key={e.slug}>
            {/* TODO(slice-03): link to /work/[slug] */}
            <Link
              href="/work"
              className="flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-foreground/30"
            >
              <span className="micro-label text-muted-foreground">
                {e.label}
              </span>
              <h3 className="text-h3 font-semibold tracking-tight">
                {e.title}
              </h3>
              <span className="text-sm text-muted-foreground">{e.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
