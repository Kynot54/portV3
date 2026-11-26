## ⚠️ Merging deploys to production

`kwhynott.dev` serves `main`. There are no real posts yet, so after merging, the live site shows:

- **nav: Work, Contact** (no Blog link)
- **`/blog` and every `/blog/<name>` return 404**

That's by design (option B). Blog appears on its own in the first deploy after a published post is added.

## Summary

- **Blog hidden until the first post.** One build-time check, `getBlogPosts()` in `src/lib/content/load.ts`, decides whether a published post exists. It controls:
  - the nav (desktop links and mobile menu)
  - `/blog`
  - `/blog/[slug]`

  Drafts and placeholders never count.

- **`/blog` list.** Newest first. Posts open in place, without leaving the page:
  - **Phones (< 640 px):**
    - Rows show title and date.
    - First tap: summary, tags and **Read full post**.
    - Second tap: the full post.
  - **Tablet and desktop:**
    - Rows show title, date, summary and tags.
    - One click: the full post.
  - **Closing takes one action.** Clicking the row again or **Collapse** closes the entry. On phones it also resets the inner level. Collapse returns you to the row, with focus on it.
  - **Entries open independently.**
  - **The address bar follows the post you're reading** (`/blog#<name>`). When several posts are open, it names the one taking up most of the screen, and it returns to `/blog` when none is on screen. Opening that link opens the post. No history entries are added, and query strings like `?ref=linkedin` are kept.
  - **It's built on the browser's native expand/collapse,** so it works with JavaScript off. Only Collapse and the address-bar sync need JavaScript, and Collapse is hidden without it.
- **`/blog/[slug]` post page:**
  - "← All posts", title, date and tags, then the post
  - real 404s for unknown names, the same as Work
- **Post formatting** (MDX):
  - headings, links, bulleted and numbered lists, quotes, inline code, dividers
  - code blocks that scroll sideways inside their own box (keyboard-scrollable)

  Inside the list, a post's headings shift one level down so the page outline stays correct.

- **Tag colours by category** (your direction, mid-review). Neon text and border on black in dark mode, with no glow. Pastel fill with deep text in light mode.
  - The categories are **AI** (cyan), **Engineering** (yellow), **Career** (violet), **Business** (orange: HR, finance and accounting, operations, consulting) and **Notes** (rose).
  - Any other tag stays grey.
  - The tag-to-category list lives in one file, `src/lib/tag-categories.ts`.
  - Every colour pair passes 4.5:1, and that's unit-tested.
  - No tag colour reuses the accent green or magenta, the keyword blue or the error red.
- **Sample posts.** Three posts in `content/samples/blog/`, all titled "Sample: …". They show only:
  - in e2e and Lighthouse (`BLOG_SAMPLES=1`)
  - on Vercel **previews** while no real post exists

  Never in production. No Vercel settings changed.

- **Ready for the V3.1 admin.** Posts keep the same fields (title, summary, date, tags, draft), and every page reads them through the loader. An admin can save posts as committed files or to a database by changing only the loader.

Design: `docs/superpowers/specs/2026-11-26-slice-04-blog-design.md`. Plan: `docs/plans/slice-04.md`.

## Preview URL

https://portv3-git-slice-04-blog-kynot54s-projects.vercel.app (sign in to Vercel). The preview shows the **sample posts**.

## Screenshots (sample posts)

| /blog desktop, collapsed                                                                                                     | /blog desktop, open (light)                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-desktop-collapsed.png?raw=true) | ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-desktop-open-light.png?raw=true)   |
| **Phone: collapsed**                                                                                                         | **Phone: level 1**                                                                                                              |
| ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-phone-collapsed.png?raw=true)   | ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-phone-level1.png?raw=true)         |
| **Phone: level 2 (full post)**                                                                                               | **Post page (phone)**                                                                                                           |
| ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-phone-level2.png?raw=true)      | ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/samples-post-page-phone.png?raw=true)      |
| **Production build, no posts: nav without Blog**                                                                             | **Production build: mobile menu**                                                                                               |
| ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/prod-nav-no-blog-desktop.png?raw=true)  | ![](https://github.com/Kynot54/portV3/blob/slice/04-blog/docs/plans/slice-04-screens/prod-nav-no-blog-mobile-menu.png?raw=true) |

Full-page post shots, dark and light: `docs/plans/slice-04-screens/samples-post-page-{dark,light}.png`.

## Test evidence

| Check                                                                                 | Result                                                                                                                                  |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| lint · format · typecheck                                                             | pass                                                                                                                                    |
| Unit (Vitest)                                                                         | **143 passed**                                                                                                                          |
| E2E (Chromium mobile, tablet and desktop; WebKit; Firefox)                            | **364 passed** (viewport-specific skips by design)                                                                                      |
| axe: every route plus 2 post pages, plus the blog list fully expanded, light and dark | 0 violations                                                                                                                            |
| Lighthouse (11 URLs, 3 runs each)                                                     | **100 in every category on every URL**                                                                                                  |
| Production build without samples (local)                                              | `/blog` 404, `/blog/none` 404, `/blog/sample-formatting` 404, no `href="/blog"` on `/` or `/work`                                       |
| Keyboard                                                                              | Automated: Tab to each row; Enter opens, Space closes; Read full post and Collapse are reachable; the focus ring outlines the whole row |

## TODO(kyle)

- **Your first post.** Add `content/blog/<name>.mdx` with `title`, `summary`, `date` (YYYY-MM-DD) and `tags`. Leave `draft` out, or set it to `false`, to publish. No code change is needed. Blog appears on the next deploy.
- **Carried over:** the meta description, the favicon, the 5 work media slots, `/contact` (Slice 5), the Services copy.

## Needs Kyle's call

- **Copy:**
  - "Read full post"
  - "Collapse"
  - "← All posts"
  - the "Blog" heading
- **Tag categories and their tags.** The current list is in `src/lib/tag-categories.ts`. Rename or regroup anything you like.
- **Syntax colours in code blocks.** These need a new package, for example `shiki`, which runs at build time and adds no client JavaScript. Worth adding once you write code-heavy posts.
- **Post names that can't be used:** `main`, `mobile-menu` and `none`. The first two collide with existing page ids. `none` is the build's empty-blog placeholder. The loader refuses them with a clear error.

## Conflicts flagged

- **Nav order.** The brief fixes the nav as **Work, Blog, Contact**. Until the first post it reads **Work, Contact** (your option B). Consequence: nothing to do. Blog returns automatically in the first deploy after a post is published.

- **Coloured tags.** The design system keeps colour for the accent (Contact pill, "Get in touch", open-to-work dot, hero visual), and its anti-goal is "other loud colours competing with the accent." Consequence: the Blog is the one page with extra colour. It's limited to small chips, with no glow and no fill in dark mode, in hues that never match the accent, and it's documented in `docs/design-tokens.md` as a flagged exception.

## Independent review

A fresh reviewer read the whole branch and found 1 critical, 4 important and 6 minor issues. I fixed these, each with a test I watched fail first:

- **Critical: a mangled link like `/blog#%` crashed the page.** The hash is now compared as-is, never decoded. The test covers `#%`, `#%E0` and `#100%`.
- **Sample posts could reach production** if `BLOG_SAMPLES=1` were ever set in Vercel. The flag is now ignored in production.
- **Hidden pages could hijack a post's link or name.** Next keeps recently visited pages in the DOM, hidden. A post named `tools` or `work` could have matched one of their sections. Lookups now stay inside the list, and title ids are prefixed (`post-title-<name>`).
- **A click just below "Collapse" closed the post** without returning you to its row. That strip now belongs to the open post.
- **The hidden-Blog state is now unit-tested.** `/blog` and `/blog/<name>` both 404 with no posts. I checked the test by removing the guard and watching it fail.
- **I regraded two minor findings to Important, because you would hit them:**
  - A stray `#` heading in a post would have made a second page title. It now renders one level down.
  - Adding your first post would have failed CI. It no longer does.

**Minor findings, after your calls:**

- **Fixed:** Lighthouse now builds the site with the sample posts itself, so it works when run on its own.
- **Fixed:** the URL keeps query strings and follows the post being read (see Summary).
- **Accepted:** text in a collapsed row can't be selected. The open post and the post page can still be selected.
- **Kept:** every code block is a tab stop, because keyboard users need it to scroll wide code.
- **Your VoiceOver pass in Safari on the row toggle:** pending, at review.

## Notes for Slice 6

- The sitemap must leave out `/blog` while there are no posts. Post pages are canonical over the inline copies on `/blog`.
- CSP: MDX compiles with `new Function` at build time, on the server.
- `/blog/none` is a prerendered 404, because the framework needs at least one post page at build time. Keep it out of the sitemap.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01N5M7LMEi61DpJ264MgKNqJ
