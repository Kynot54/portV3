import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { blogPosts } from "@/lib/blog";
import { getWorkList } from "@/lib/content/load";
import type { BlogPost } from "@/lib/content/types";
import { isServicesEnabled } from "@/lib/flags";
import { SITE_ORIGIN } from "@/lib/seo";

const at = (path: string) => new URL(path, SITE_ORIGIN).toString();

/**
 * Only pages that exist for visitors: Blog appears once a post is published,
 * Services only when switched on; samples, /blog/none and /api never.
 */
export function buildSitemap(deps: {
  work: { slug: string }[];
  posts: BlogPost[];
  services: boolean;
}): MetadataRoute.Sitemap {
  return [
    { url: at("/") },
    { url: at("/work") },
    ...deps.work.map((e) => ({ url: at(`/work/${e.slug}`) })),
    ...(deps.posts.length
      ? [
          { url: at("/blog") },
          ...deps.posts.map((p) => ({
            url: at(`/blog/${p.slug}`),
            lastModified: p.date,
          })),
        ]
      : []),
    { url: at("/contact") },
    ...(deps.services ? [{ url: at("/services") }] : []),
  ];
}

async function workList() {
  "use cache";
  cacheLife("max");
  return getWorkList();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap({
    work: await workList(),
    posts: await blogPosts(),
    services: isServicesEnabled(),
  });
}
