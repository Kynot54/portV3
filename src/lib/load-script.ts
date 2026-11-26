const pending = new Map<string, Promise<void>>();

/** Loads a third-party script once, on demand. A failed load can be retried. */
export function loadScript(src: string): Promise<void> {
  const existing = pending.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.addEventListener("load", () => resolve());
    el.addEventListener("error", () => {
      el.remove();
      pending.delete(src);
      reject(new Error(`Failed to load ${src}`));
    });
    document.head.append(el);
  });
  pending.set(src, promise);
  return promise;
}
