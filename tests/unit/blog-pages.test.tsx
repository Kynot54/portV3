import BlogPage from "@/app/blog/page";
import PostPage, { generateStaticParams } from "@/app/blog/[slug]/page";

// No published posts: what production serves until Kyle's first post.
vi.mock("@/lib/blog", () => ({
  blogPosts: async () => [],
  hasBlog: async () => false,
}));

const isNotFound = (e: unknown) =>
  String((e as { digest?: string }).digest).includes("404");

test("/blog is a 404 with no published posts", async () => {
  await expect(BlogPage()).rejects.toSatisfy(isNotFound);
});

test("/blog/[slug] is a 404 with no published posts, including the sentinel", async () => {
  expect(await generateStaticParams()).toEqual([{ slug: "none" }]);
  for (const slug of ["none", "sample-formatting"])
    await expect(
      PostPage({
        params: Promise.resolve({ slug }),
      } as PageProps<"/blog/[slug]">),
    ).rejects.toSatisfy(isNotFound);
});
