import { SITE_ORIGIN } from "@/lib/seo";

export type NavItem = { href: "/work" | "/blog" | "/contact"; label: string };

export const siteConfig = {
  name: "Kyle Whynott",
  /** Fixed, so cards and canonicals never point at a preview host. */
  url: SITE_ORIGIN,
  nav: [
    { href: "/work", label: "Work" },
    { href: "/blog", label: "Blog" },
  ] satisfies NavItem[],
  /** Rendered as the accent pill, always last. */
  contact: { href: "/contact", label: "Contact" } satisfies NavItem,
  social: {
    github: "https://github.com/Kynot54",
    linkedin: "https://www.linkedin.com/in/kyle-whynott",
  },
} as const;

export function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
