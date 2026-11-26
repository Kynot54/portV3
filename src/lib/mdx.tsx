import type { ComponentProps, ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";

/*
 * Compiles an MDX string (from our own repo content) into React elements at
 * build/render time on the server (only server components import this). Invalid MDX throws, so a broken content
 * file fails the build instead of shipping. No client JS is involved.
 */

const muted = "text-body-fluid text-muted-foreground";

type Level = 2 | 3 | 4 | 5 | 6;
const headingClass: Record<Level, string> = {
  2: "mt-8 text-h2 font-bold tracking-tight",
  3: "mt-8 text-h3 font-bold tracking-tight",
  4: "mt-6 text-lg font-semibold",
  5: "mt-6 text-base font-semibold",
  6: "mt-6 text-base font-semibold",
};

function heading(level: Level) {
  const Tag = `h${level}` as const;
  const Heading = (props: ComponentProps<"h2">) => (
    <Tag className={headingClass[level]} {...props} />
  );
  Heading.displayName = Tag;
  return Heading;
}

function components(offset: 0 | 1) {
  return {
    h2: heading((2 + offset) as Level),
    h3: heading((3 + offset) as Level),
    h4: heading((4 + offset) as Level),
    p: (props: ComponentProps<"p">) => <p className={muted} {...props} />,
    a: ({ href = "", ...props }: ComponentProps<"a">) => (
      <a
        className="link"
        href={href}
        rel={/^https?:\/\//.test(href) ? "noopener" : undefined}
        {...props}
      />
    ),
    ul: (props: ComponentProps<"ul">) => (
      <ul role="list" className={`ml-5 list-disc ${muted}`} {...props} />
    ),
    ol: (props: ComponentProps<"ol">) => (
      <ol role="list" className={`ml-5 list-decimal ${muted}`} {...props} />
    ),
    li: (props: ComponentProps<"li">) => <li className="mt-1" {...props} />,
    blockquote: (props: ComponentProps<"blockquote">) => (
      <blockquote
        className="border-l-2 border-border pl-4 italic [&>p]:text-muted-foreground"
        {...props}
      />
    ),
    hr: (props: ComponentProps<"hr">) => (
      <hr className="my-4 border-border" {...props} />
    ),
    code: (props: ComponentProps<"code">) => (
      <code className="font-mono text-[0.9em]" {...props} />
    ),
    // Wide code scrolls inside its own box; tabIndex lets keyboard users scroll it.
    pre: (props: ComponentProps<"pre">) => (
      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-border p-4 font-mono text-sm [&_code]:text-[1em]"
        {...props}
      />
    ),
  };
}

export async function renderMdx(
  source: string,
  opts: { headingOffset?: 0 | 1 } = {},
): Promise<ReactElement> {
  const { default: Content } = await evaluate(source, { ...runtime });
  return (
    <div className="flex flex-col gap-4">
      <Content components={components(opts.headingOffset ?? 0)} />
    </div>
  );
}
