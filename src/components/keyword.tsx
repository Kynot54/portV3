import type { ReactNode } from "react";

/** A key term, shown in blue. Not a link: links use the `link` utility. */
export function Keyword({ children }: { children: ReactNode }) {
  return <span className="text-keyword">{children}</span>;
}
