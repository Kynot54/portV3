import { ChevronDown } from "lucide-react";
import type { BlogPost } from "@/lib/content/types";
import { formatDate } from "@/lib/format-date";
import { renderMdx } from "@/lib/mdx";
import { PostMeta, TagList } from "./post-meta";

/*
 * One /blog entry, built on native <details> so it works without JS.
 * - The title is a real h2 outside <summary> (headings inside a summary drop out
 *   of the outline). <summary> is named by the title and its ::after overlay
 *   makes the whole row clickable; open content sits above the overlay.
 * - Below 640px: row = title + date; level 1 = summary + tags + "Read full post"
 *   (an inner <details>); level 2 = the post. At 640px+: the row already shows
 *   summary + tags, and opening shows the post. CSS: .blog-entry in globals.css.
 */
export async function BlogEntry({ post }: { post: BlogPost }) {
  const titleId = `${post.slug}-title`;
  const body = await renderMdx(post.body, { headingOffset: 1 });

  return (
    <li id={post.slug} className="blog-entry relative border-t py-6">
      <div className="pr-10 sm:pr-36">
        <h2 id={titleId} className="text-h3 font-bold tracking-tight">
          {post.title}
        </h2>
        <time
          dateTime={post.date}
          className="mt-1 block text-sm text-muted-foreground sm:hidden"
        >
          {formatDate(post.date)}
        </time>
        <div className="mt-2 hidden flex-col gap-3 sm:flex">
          <p className="text-body-fluid text-muted-foreground">
            {post.summary}
          </p>
          <PostMeta post={post} />
        </div>
      </div>

      {/* Visual hint only, outside <summary> so the toggle's name stays the
          title (label-in-name); clicks on it reach the row overlay. */}
      <span
        aria-hidden="true"
        className="blog-entry-hint absolute top-6 right-8 hidden min-h-11 items-center text-sm text-muted-foreground sm:inline-flex"
      >
        <span className="blog-entry-hint-closed">Read full post</span>
        <span className="blog-entry-hint-open">Collapse</span>
      </span>

      <details data-entry className="group">
        <summary
          aria-labelledby={titleId}
          className="blog-entry-toggle list-none [&::-webkit-details-marker]:hidden"
        >
          <ChevronDown
            aria-hidden="true"
            className="absolute top-9 right-0 size-5 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="blog-entry-content">
          <div className="mt-3 flex flex-col gap-3 sm:hidden">
            <p className="text-body-fluid text-muted-foreground">
              {post.summary}
            </p>
            <TagList tags={post.tags} />
          </div>
          <details data-inner className="mt-3 sm:hidden">
            <summary className="link inline-flex min-h-11 cursor-pointer list-none items-center text-sm [&::-webkit-details-marker]:hidden">
              Read full post
            </summary>
          </details>
          <div className="blog-entry-body mt-6">
            {body}
            <button
              type="button"
              data-collapse
              className="js-only link mt-8 inline-flex min-h-11 items-center text-sm"
            >
              Collapse<span aria-hidden="true">&nbsp;▴</span>
            </button>
          </div>
        </div>
      </details>
    </li>
  );
}
