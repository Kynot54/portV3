import type { BlogPost } from "@/lib/content/types";
import { formatDate } from "@/lib/format-date";
import { tagCategory } from "@/lib/tag-categories";
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
      <TagList tags={post.tags} />
    </div>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul role="list" aria-label="Tags" className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const category = tagCategory(t);
        return (
          <li
            key={t}
            data-category={category ?? undefined}
            className={cn(
              "tag-chip micro-label rounded-full border px-3 py-1",
              !category && "text-muted-foreground",
            )}
          >
            {t}
          </li>
        );
      })}
    </ul>
  );
}
