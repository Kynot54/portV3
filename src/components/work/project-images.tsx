import Image from "next/image";
import type { WorkMedia } from "@/lib/content/types";

/** The project's two images, side by side from tablet width up. Image 1 loads first. */
export function ProjectImages({ images }: { images: WorkMedia["images"] }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {images.map((img, i) => (
        <div
          key={img.src}
          className="relative aspect-video overflow-hidden rounded-xl border"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            preload={i === 0}
            sizes="(min-width: 768px) 384px, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
