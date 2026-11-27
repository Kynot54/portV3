import { render, screen } from "@testing-library/react";
import { ProjectClip } from "@/components/work/project-clip";
import { ProjectImages } from "@/components/work/project-images";
import type { WorkMedia } from "@/lib/content/types";

const MEDIA: WorkMedia = {
  images: [
    { src: "/images/work/x/1.png", alt: "The dashboard" },
    { src: "/images/work/x/2.png", alt: "The report view" },
  ],
  clip: {
    src: "/images/work/x/clip.mp4",
    description: "Reading the AI insights",
  },
};

test("ProjectImages shows both images with their alt text", () => {
  render(<ProjectImages images={MEDIA.images} />);
  expect(screen.getByAltText("The dashboard")).toBeInTheDocument();
  expect(screen.getByAltText("The report view")).toBeInTheDocument();
});

test("ProjectClip: controls, never autoplays, image 1 as poster, caption", () => {
  render(<ProjectClip clip={MEDIA.clip!} poster={MEDIA.images[0].src} />);
  const video = document.querySelector("video")!;
  expect(video).toHaveAttribute("controls");
  expect(video).not.toHaveAttribute("autoplay");
  expect(video).toHaveAttribute("preload", "none");
  expect(video).toHaveAttribute("playsinline");
  expect(video.muted).toBe(true);
  // An optimised copy of image 1, not the original file.
  expect(video.getAttribute("poster")).toContain(
    encodeURIComponent("/images/work/x/1.png"),
  );
  expect(screen.getByRole("figure")).toHaveAccessibleName(
    "Reading the AI insights",
  );
});
