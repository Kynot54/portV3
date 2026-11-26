"use client";

import { useEffect } from "react";

/*
 * Progressive enhancement for the /blog list (the markup works without it):
 * - closing an entry also closes its inner "Read full post" level;
 * - the open entry is mirrored in the URL as /blog#<slug> (replaceState, so no
 *   history entries), and loading or changing to that hash opens it;
 * - "Collapse" closes its entry and returns the reader to the entry's row.
 * Renders nothing; it finds the list by its class.
 */
export function BlogController({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".blog-list");
    if (!list) return;

    const entryOf = (el: Element) => el.closest<HTMLLIElement>("li.blog-entry");

    const onToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement;
      if (!details.matches("details[data-entry]")) return;
      const li = entryOf(details);
      if (!li) return;
      if (details.open) {
        history.replaceState(history.state, "", `#${li.id}`);
      } else {
        const inner = li.querySelector<HTMLDetailsElement>(
          "details[data-inner]",
        );
        if (inner) inner.open = false;
        if (location.hash === `#${li.id}`)
          history.replaceState(history.state, "", location.pathname);
      }
    };

    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest("button[data-collapse]");
      if (!button) return;
      const li = entryOf(button);
      const details = li?.querySelector<HTMLDetailsElement>(
        "details[data-entry]",
      );
      if (!li || !details) return;
      details.open = false;
      li.scrollIntoView({ block: "start" });
      details.querySelector("summary")?.focus({ preventScroll: true });
    };

    // Slugs are [a-z0-9-], so the raw hash is compared as-is: no decoding (a
    // malformed escape like "#%" would throw) and no selector built from it.
    // The lookup stays inside the list, because pages Next keeps hidden under
    // <Activity> can hold elements with the same id.
    const entryFor = (slug: string) =>
      [...list.querySelectorAll<HTMLLIElement>("li.blog-entry")].find(
        (li) => li.id === slug,
      );

    const openFromHash = () => {
      const slug = location.hash.slice(1);
      if (!slugs.includes(slug)) return;
      const li = entryFor(slug);
      if (!li) return;
      li.querySelectorAll<HTMLDetailsElement>("details").forEach((d) => {
        d.open = true;
      });
      li.scrollIntoView({ block: "start" });
    };

    list.addEventListener("toggle", onToggle, true);
    list.addEventListener("click", onClick);
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
    return () => {
      list.removeEventListener("toggle", onToggle, true);
      list.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [slugs]);

  return null;
}
