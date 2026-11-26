/*
 * Blog tag categories (Kyle, 2026-11-26). Each category has its own colour
 * (tokens --tag-<category> and --tag-<category>-fill in globals.css). A tag not
 * listed here stays grey. Edit this list to add tags; a later admin can too.
 */
export const TAG_CATEGORIES = {
  ai: ["ai", "ml", "llm", "rag", "agents"],
  engineering: [
    "engineering",
    "typescript",
    "nextjs",
    "python",
    "web",
    "devops",
    "architecture",
  ],
  career: ["career", "interviews", "teaching", "learning"],
  /** Umbrella for HR, finance/accounting, operations and the like. */
  business: [
    "business",
    "hr",
    "finance",
    "accounting",
    "operations",
    "consulting",
  ],
  notes: ["notes", "til"],
} as const;

export type TagCategory = keyof typeof TAG_CATEGORIES;

export function tagCategory(tag: string): TagCategory | null {
  const t = tag.toLowerCase();
  for (const [category, tags] of Object.entries(TAG_CATEGORIES))
    if ((tags as readonly string[]).includes(t)) return category as TagCategory;
  return null;
}
