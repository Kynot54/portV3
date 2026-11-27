import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { MediaPlaceholder } from "@/components/work/media-placeholder";
import { getWorkList } from "@/lib/content/load";
import { renderMdx } from "@/lib/mdx";
import { describeWork, cardAlt, pageMetadata } from "@/lib/seo";

// Every /work page is fully static. An unknown slug is resolved before the
// response starts, so notFound() returns a real HTTP 404 (Next 16 ensureStatic).
export const ensureStatic = "navigation";

// Content only changes on deploy.
async function workList() {
  "use cache";
  cacheLife("max");
  return getWorkList();
}

async function entryFor(slug: string) {
  return (await workList()).find((e) => e.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return (await workList()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const entry = await entryFor((await params).slug);
  return entry
    ? pageMetadata({
        title: entry.title,
        description: describeWork(entry),
        path: `/work/${entry.slug}`,
        image: {
          path: `/work/${entry.slug}/opengraph-image`,
          alt: cardAlt(entry.title),
        },
      })
    : {};
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-h2 font-bold tracking-tight">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function WorkDetailPage({
  params,
}: PageProps<"/work/[slug]">) {
  const entry = await entryFor((await params).slug);
  if (!entry) notFound();
  const body = await renderMdx(entry.body);

  return (
    <article className="mx-auto w-full max-w-3xl px-gutter py-section">
      <Link
        href="/work"
        className="link inline-flex min-h-11 items-center text-sm"
      >
        <span aria-hidden="true">←&nbsp;</span>All work
      </Link>
      <p className="micro-label mt-8 text-muted-foreground">{entry.label}</p>
      <h1 className="mt-3 text-hero font-bold tracking-tight">{entry.title}</h1>
      <p className="mt-4 text-body-fluid text-muted-foreground">
        {entry.summary}
      </p>

      <MediaPlaceholder />

      <Section id="context" title="Context">
        <p className="text-body-fluid text-muted-foreground">{entry.context}</p>
      </Section>
      <Section id="action" title="What I Built">
        {body}
      </Section>
      <Section id="result" title={entry.impactHeading}>
        {entry.impact.length === 1 ? (
          <p className="text-body-fluid text-muted-foreground">
            {entry.impact[0]}
          </p>
        ) : (
          <ul
            role="list"
            className="ml-5 list-disc text-body-fluid text-muted-foreground"
          >
            {entry.impact.map((i) => (
              <li key={i} className="mt-1">
                {i}
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section id="learned" title="What I Learned">
        <p className="text-body-fluid text-muted-foreground">{entry.learned}</p>
      </Section>
      <Section id="tools" title="Built With">
        <ul
          role="list"
          aria-labelledby="tools"
          className="flex flex-wrap gap-2"
        >
          {entry.tools.map((t) => (
            <li
              key={t}
              className="micro-label rounded-full border px-3 py-1.5 text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <p className="mt-12 text-sm text-muted-foreground">
        {`${entry.role} · ${entry.location} · ${entry.period}`}
      </p>
    </article>
  );
}
