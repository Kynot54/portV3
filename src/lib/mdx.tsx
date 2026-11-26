import type { ComponentProps, ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";

/*
 * Compiles an MDX string (from our own repo content) into React elements at
 * build/render time on the server (only server components import this). Invalid MDX throws, so a broken content
 * file fails the build instead of shipping. No client JS is involved.
 */

const components = {
  p: (props: ComponentProps<"p">) => (
    <p className="text-body-fluid text-muted-foreground" {...props} />
  ),
  a: ({ href = "", ...props }: ComponentProps<"a">) => (
    <a
      className="link"
      href={href}
      rel={/^https?:\/\//.test(href) ? "noopener" : undefined}
      {...props}
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      role="list"
      className="ml-5 list-disc text-body-fluid text-muted-foreground"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => <li className="mt-1" {...props} />,
};

export async function renderMdx(source: string): Promise<ReactElement> {
  const { default: Content } = await evaluate(source, { ...runtime });
  return (
    <div className="flex flex-col gap-4">
      <Content components={components} />
    </div>
  );
}
