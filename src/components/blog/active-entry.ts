export type EntryBox = { slug: string; top: number; bottom: number };

/**
 * The open entry the reader is on: the one taking up the most of the screen
 * (Kyle: the URL names the post being viewed). Null when no open entry shows.
 */
export function activeEntry(
  open: EntryBox[],
  viewportHeight: number,
): string | null {
  let best: string | null = null;
  let most = 0;
  for (const { slug, top, bottom } of open) {
    const visible = Math.min(bottom, viewportHeight) - Math.max(top, 0);
    if (visible > most) {
      most = visible;
      best = slug;
    }
  }
  return best;
}
