import { getImageProps } from "next/image";
import type { WorkMedia } from "@/lib/content/types";

/**
 * The project's silent clip, with controls. It never starts by itself and
 * loads nothing until played except an optimised copy of image 1 as its poster.
 */
export function ProjectClip({
  clip,
  poster,
}: {
  clip: NonNullable<WorkMedia["clip"]>;
  poster: string;
}) {
  const { src: posterSrc } = getImageProps({
    src: poster,
    alt: "",
    width: 1920,
    height: 1080,
    sizes: "(min-width: 768px) 768px, 100vw",
  }).props;
  return (
    <figure aria-labelledby="clip-caption">
      <video
        src={clip.src}
        poster={posterSrc}
        controls
        muted
        playsInline
        preload="none"
        className="aspect-video w-full rounded-xl border"
      />
      <figcaption
        id="clip-caption"
        className="mt-3 text-sm text-muted-foreground"
      >
        {clip.description}
      </figcaption>
    </figure>
  );
}
