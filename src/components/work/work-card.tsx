import Link from "next/link";
import type { WorkEntry } from "@/lib/content/types";

/** One project card. Home uses h3 (under "Selected work"); /work uses h2 (under the h1). */
export function WorkCard({
  entry,
  headingLevel,
}: {
  entry: WorkEntry;
  headingLevel: 2 | 3;
}) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      href={`/work/${entry.slug}`}
      className="flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-foreground/30"
    >
      <span className="micro-label text-muted-foreground">{entry.label}</span>
      <Title className="text-h3 font-semibold tracking-tight">
        {entry.title}
      </Title>
      <span className="text-sm text-muted-foreground">{entry.summary}</span>
    </Link>
  );
}
