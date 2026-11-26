import type { BlogPost } from "@/lib/content/types";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";

/** Date and tags, shared by the list and the post page. */
export function PostMeta({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}
    >
      <time dateTime={post.date} className="text-sm text-muted-foreground">
        {formatDate(post.date)}
      </time>
      {post.tags.length > 0 && (
        <ul role="list" aria-label="Tags" className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li
              key={t}
              className="micro-label rounded-full border px-3 py-1 text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
