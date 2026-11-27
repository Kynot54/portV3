"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { loadScript } from "@/lib/load-script";

const EMBED_SRC = "https://app.cal.com/embed/embed.js";

type CalApi = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  ns?: object;
  loaded?: boolean;
};
declare global {
  interface Window {
    Cal?: CalApi;
  }
}

/** Cal.com's official bootstrap, minus the script tag: queue calls until embed.js runs them. */
function cal(): CalApi {
  if (!window.Cal) {
    const queue: CalApi = (...args: unknown[]) => queue.q!.push(args);
    queue.q = [];
    queue.ns = {};
    queue.loaded = true;
    window.Cal = queue;
  }
  return window.Cal;
}

/*
 * "Book a call": nothing from Cal.com loads until the button is pressed. The
 * calendar then renders full width into #booking-calendar (below the form and
 * this column), takes focus and scrolls into view. If it doesn't appear, a
 * direct link takes over.
 */
export function Booking({
  calLink,
  intro = "A 30-minute intro call.",
  label = "Book a call",
  timeoutMs = 10_000,
}: {
  calLink: string | undefined;
  /** The line above the button. */
  intro?: string;
  /** The button's text before the calendar loads. */
  label?: string;
  timeoutMs?: number;
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "failed">(
    "idle",
  );
  const region = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLAnchorElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";

  useEffect(() => {
    const el = region.current;
    if (phase !== "loading" || !el || !calLink) return;
    const hasIframe = () => !!el.querySelector("iframe");
    const Cal = cal();
    Cal("init", { origin: "https://cal.com" });
    Cal("inline", {
      elementOrSelector: el,
      calLink,
      config: { layout: "month_view", theme },
    });
    Cal("ui", { theme });
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "start" });
    loadScript(EMBED_SRC).catch(() => setPhase("failed"));

    if (hasIframe()) {
      setPhase("ready");
      return;
    }
    const observer = new MutationObserver(() => {
      if (hasIframe()) setPhase((p) => (p === "loading" ? "ready" : p));
    });
    observer.observe(el, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      if (!hasIframe()) setPhase((p) => (p === "loading" ? "failed" : p));
    }, timeoutMs);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
    // Runs once per "Book a call" press; theme is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "loading"]);

  // On failure the empty calendar goes away and the direct link takes focus.
  useEffect(() => {
    if (phase === "failed") fallback.current?.focus();
  }, [phase]);

  const showCalendar = phase === "loading" || phase === "ready";
  const target = showCalendar
    ? document.getElementById("booking-calendar")
    : null;
  const calendar = (
    <div
      ref={region}
      role="region"
      aria-label="Booking calendar"
      tabIndex={-1}
      className="mt-8 min-h-[32rem] w-full outline-none"
    />
  );

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-body-fluid text-muted-foreground">{intro}</p>
      {calLink && (phase === "idle" || phase === "loading") && (
        <Button
          type="button"
          variant="outline"
          disabled={phase === "loading"}
          onClick={() => setPhase("loading")}
          className="h-11 px-5 text-sm"
        >
          {phase === "loading" ? "Loading calendar…" : label}
        </Button>
      )}
      {calLink && phase === "failed" && (
        <a
          ref={fallback}
          href={`https://cal.com/${calLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex min-h-11 items-center text-sm"
        >
          Open the booking page
        </a>
      )}
      {showCalendar &&
        calLink &&
        (target ? createPortal(calendar, target) : calendar)}
    </div>
  );
}
