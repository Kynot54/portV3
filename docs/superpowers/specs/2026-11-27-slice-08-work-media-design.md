# Slice 8: Project images and clips (design)

**Status:** approved by Kyle, 2026-11-27. Branch `slice/08-work-media`.

## Intent

Show Kyle's projects visually. Each project gets two images and, optionally, one short silent clip:

- **Cards** (Home's Selected work and the Work list) show a still thumbnail. On a device with a mouse, the clip plays in its place while the card is hovered or keyboard-focused. It stops and returns to the still as soon as the pointer or focus leaves.
- **The project page** shows the two images near the top, and the clip, if there is one, at the bottom.

## Decided with Kyle

- **Hover playback on cards**, only when reduced motion is off. The clip stops at once and reverts to the still when the hover ends.
- **Phones and tablets** (no hover) never play clips on cards. There, the clip is only on the project page.
- **Project page:** two main images. A video at the bottom if the project has one.
- **Approach 1:** plain HTML `<video>`, files in the repo, no video host and no new packages. Kyle handed over the how; this is my pick (the reasons are under Approaches).

## Approaches considered

1. **Plain `<video>`, files in `public/` (chosen).** No account, no package, works in every browser. Costs Vercel bandwidth; at 2–5 MB per clip that's fine for a portfolio.
2. **A video host (Mux, Cloudflare Stream, Vercel Blob).** Adaptive streaming, but a new account, possibly a monthly cost, a new origin in the security policy, and dependencies, all for five short silent clips.
3. **Animated WebP or GIF.** 5–10× larger, lower quality, and can't be paused and reverted to a still cleanly.

**Revisit trigger (Kyle, 2026-11-27):** approach 1 is approved on the condition that hosting gets revisited if traffic surges unexpectedly. Watch Vercel's bandwidth usage. If clips start to dominate it, move them to a video host (approach 2) or a CDN. Only the `src` values and the security policy's `media-src` would change; the cards and page stay the same.

## Goals, non-goals, anti-goals

- **Goals:** recruiters see the work at a glance; the site stays at Lighthouse 100 and passes axe; Kyle can add media without touching code.
- **Non-goals:** clips with sound, galleries of more than two images, autoplaying video on the project page, a video host.
- **Anti-goals:**
  - Motion that ignores reduced motion.
  - Anything that flashes more than 3 times per second.
  - Clips downloading for visitors who never hover.
  - Layout shift when an image or clip loads.

## The files Kyle provides (per project)

In `public/images/work/<slug>/`:

| File                  | Required | Spec                                                                                                                                                                                                                                                                                         |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.png` and `2.png`   | Yes, both | 1920 × 1080 (16:9), PNG (or `.jpg` for photo-heavy shots), under ~3 MB each. Image 1 is also the card thumbnail and the video's still frame, so make it the clearest view of the project.                                                                                                     |
| `clip.mp4`            | Optional  | <ul><li>Up to about 20 seconds; it loops on the card.</li><li>1920 × 1080 or 1280 × 720 (16:9), H.264 MP4.</li><li>**No audio track.**</li><li>Under ~5 MB.</li><li>Nothing that flashes more than 3 times per second.</li></ul> |

The rules from the existing README still apply: hide client data, check that each client is fine with the image being public, and use the existing slugs (`working-entrepreneurs`, `control-bh`, `video-interview-plugin`, `ulti-health`, `ai-mind-companion`).

Each project's frontmatter names its media, with alt text Kyle approves:

```yaml
media:
  images:
    - src: 1.png
      alt: "…"
    - src: 2.png
      alt: "…"
  clip:            # optional
    src: clip.mp4
    description: "…"   # one line saying what the clip shows (a silent video needs a text alternative)
```

The content loader fails the build if:

- an image's alt text is missing;
- a listed file doesn't exist;
- a project lists anything other than exactly two images.

## How it works

- **Cards:**
  - **Still:** image 1, 16:9, above the label and title. It's served through Next's image component, with sizes per layout, lazy-loaded below the fold.
  - **Playback:** happens only when the device has a fine pointer that can hover (`(hover: hover) and (pointer: fine)`), reduced motion is off, and the card is hovered or focused. The clip is muted, loops, and doesn't load until the first hover (`preload="none"`).
  - **When the hover or focus ends:** the clip pauses, rewinds and is hidden, and the still shows.
  - **Not announced:** the clip is decorative on the card, so it's hidden from screen readers. The card's link name stays the project title.
- **Project page:**
  - **Images:** the two images replace the "Preview coming soon" frame. They sit side by side from tablet width up and stack on phones. Image 1 loads first, because it's the largest thing on the screen.
  - **Clip:** at the bottom, after "What I learned", under a "See it in action" heading.
    - Native controls; it never starts by itself.
    - Muted, `playsinline`, with image 1 as its still frame and `preload="none"`.
    - The clip's description sits under it as a caption.
- **Projects without media:** the card stays as it is today, text only. The page keeps the "Preview coming soon" frame until both images exist. A missing clip just means no video section.
- **Security policy:** media comes from the site itself, so the policy doesn't change.
- **Quality bar:** the same as every slice. Axe 0; Lighthouse at least 0.95 with accessibility at 1.0; no layout shift; e2e tests on hover, focus, leaving, reduced motion and touch (no playback); no console errors.

## Left to the builder

The component structure, how the card's hover state is wired, the test fixtures (tiny sample media for tests only), and the exact `sizes` values.

## Open (Kyle's)

- **Alt text** for each image and the one-line description for each clip, once the files exist. I'll draft them from the images for Kyle to approve.
