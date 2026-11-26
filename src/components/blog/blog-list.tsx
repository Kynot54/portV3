import type { BlogPost } from "@/lib/content/types";
import { BlogEntry } from "./blog-entry";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul role="list" className="blog-list mt-10 border-b">
      {posts.map((p) => (
        <BlogEntry key={p.slug} post={p} />
      ))}
    </ul>
  );
}
