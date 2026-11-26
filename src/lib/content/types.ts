export type WorkEntry = {
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM */
  date: string;
  tags: string[];
  /** True for stand-in entries; titles start with "Placeholder". */
  placeholder: boolean;
  /** Shown in Home's Selected work. */
  featured: boolean;
  /** Position in Selected work (ascending); required when featured. */
  order: number | null;
  /** Card micro-label, e.g. "AI · 2025–26"; required when featured. */
  label: string | null;
  /** CARL detail-page fields; required on every non-placeholder entry. */
  role: string;
  location: string;
  /** Display range, e.g. "Oct 2025 – Jan 2026". */
  period: string;
  context: string;
  impactHeading: "Result" | "What it does";
  /** The Result points (one item renders as a paragraph). */
  impact: string[];
  learned: string;
  /** "Built with" list. */
  tools: string[];
  /** MDX: the "What I built" (Action) prose. */
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD */
  date: string;
  tags: string[];
  placeholder: boolean;
  draft: boolean;
  body: string;
};
