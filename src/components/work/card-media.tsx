"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WorkMedia } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const CAN_HOVER = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Stops whichever card is playing, so focus plus hover never plays two. */
let stopCurrent: (() => void) | null = null;

/**
 * A project card's thumbnail (image 1). On a mouse or trackpad, with reduced
 * motion off, the clip plays while the card is hovered or keyboard-focused,
 * and stops, rewinds and gives way to the still the moment that ends. Phones
 * and tablets always show the still (Kyle, 2026-11-27).
 */
export function CardMedia({
  media,
  sizes,
}: {
  media: WorkMedia;
  sizes: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasClip = media.clip !== null;

  useEffect(() => {
    const v = video.current;
    const card = box.current?.closest("a");
    if (!hasClip || !v || !card) return;
    const pointer = window.matchMedia(CAN_HOVER);
    const reduced = window.matchMedia(REDUCED);
    let active = false;
    // Each start gets a number, so a late result from an earlier hover is ignored.
    let run = 0;

    const stop = () => {
      active = false;
      if (stopCurrent === stop) stopCurrent = null;
      setPlaying(false);
      v.pause();
      v.currentTime = 0;
    };
    const start = (e: Event) => {
      if ((e as PointerEvent).pointerType === "touch") return;
      if (!pointer.matches || reduced.matches || active) return;
      if (stopCurrent !== stop) stopCurrent?.();
      stopCurrent = stop;
      active = true;
      const mine = ++run;
      setPlaying(true);
      v.play().then(
        // Left before the clip started: make sure it ends paused.
        () => {
          if (!active) v.pause();
        },
        // The browser can't play it: keep the still.
        () => {
          if (active && mine === run) stop();
        },
      );
    };
    const onReduced = (e: MediaQueryListEvent) => {
      if (e.matches) stop();
    };

    card.addEventListener("pointerenter", start);
    card.addEventListener("focusin", start);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusout", stop);
    reduced.addEventListener("change", onReduced);
    return () => {
      if (stopCurrent === stop) stopCurrent = null;
      card.removeEventListener("pointerenter", start);
      card.removeEventListener("focusin", start);
      card.removeEventListener("pointerleave", stop);
      card.removeEventListener("focusout", stop);
      reduced.removeEventListener("change", onReduced);
    };
  }, [hasClip]);

  return (
    <div
      ref={box}
      data-playing={playing}
      className="relative aspect-video overflow-hidden rounded-lg border"
    >
      {/* Decorative: the card's title names the link. */}
      <Image
        src={media.images[0].src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
      />
      {media.clip && (
        <video
          ref={video}
          src={media.clip.src}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className={cn(
            "absolute inset-0 size-full object-cover",
            !playing && "invisible",
          )}
        />
      )}
    </div>
  );
}
