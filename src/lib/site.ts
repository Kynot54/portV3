export type NavItem = { href: "/work" | "/blog" | "/contact"; label: string };

export const siteConfig = {
  name: "Kyle Whynott",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwhynott.dev",
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
