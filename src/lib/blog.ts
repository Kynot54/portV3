import { cacheLife } from "next/cache";
import { getBlogPosts } from "@/lib/content/load";

// Posts only change on deploy, so every page reads them once at build time.
export async function blogPosts() {
  "use cache";
  cacheLife("max");
  return getBlogPosts();
}

/** Blog is in the nav and its routes exist only once a post is published. */
export async function hasBlog(): Promise<boolean> {
  return (await blogPosts()).length > 0;
}
