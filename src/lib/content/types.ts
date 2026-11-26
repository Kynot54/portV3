export type WorkEntry = {
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM */
  date: string;
  tags: string[];
  /** True for stand-in entries; titles start with "Placeholder". */
  placeholder: boolean;
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
