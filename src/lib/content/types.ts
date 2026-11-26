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
