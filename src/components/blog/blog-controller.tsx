"use client";

import { useEffect } from "react";
import { activeEntry } from "./active-entry";

/*
 * Progressive enhancement for the /blog list (the markup works without it):
 * - closing an entry also closes its inner "Read full post" level;
 * - the URL names the open post being read, /blog#<slug>: the open entry taking
 *   up the most of the screen, or plain /blog when none shows (replaceState, so
 *   no history entries; the query string is kept). Loading that hash opens it;
 * - "Collapse" closes its entry and returns the reader to the entry's row.
 * Renders nothing; it finds the list by its class.
 */
export function BlogController({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".blog-list");
    if (!list) return;

    const entryOf = (el: Element) => el.closest<HTMLLIElement>("li.blog-entry");

    const syncUrl = () => {
      const open = [
        ...list.querySelectorAll<HTMLLIElement>(
          "li.blog-entry:has(> details[data-entry][open])",
        ),
      ].map((li) => {
        const r = li.getBoundingClientRect();
        return { slug: li.id, top: r.top, bottom: r.bottom };
      });
      const slug = activeEntry(open, window.innerHeight);
      const url =
        location.pathname + location.search + (slug ? `#${slug}` : "");
      if (url !== location.pathname + location.search + location.hash)
        history.replaceState(history.state, "", url);
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncUrl);
    };

    const onToggle = (e: Event) => {
      const details = e.target as HTMLDetailsElement;
      if (!details.matches("details[data-entry]")) return;
      if (!details.open) {
        const inner = entryOf(details)?.querySelector<HTMLDetailsElement>(
          "details[data-inner]",
        );
        if (inner) inner.open = false;
      }
      syncUrl();
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
    window.addEventListener("scroll", onScroll, { passive: true });
    list.addEventListener("click", onClick);
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
    return () => {
      list.removeEventListener("toggle", onToggle, true);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      list.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [slugs]);

  return null;
}
