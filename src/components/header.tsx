"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { isCurrent, siteConfig } from "@/lib/site";

const navLink =
  "inline-flex min-h-11 items-center rounded-full px-3 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:font-medium";

function isVisible(el: HTMLElement): boolean {
  return typeof el.checkVisibility === "function"
    ? el.checkVisibility()
    : el.offsetParent !== null;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // Last nav control that had focus; survives the browser dropping focus to
  // <body> when that control is hidden by a breakpoint change.
  const lastFocus = useRef<HTMLElement | null>(null);

  // Close on route change (adjusting state during render, per React docs).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape closes and returns focus to the menu button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // A tap outside the nav closes the menu.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Crossing 640px closes the mobile menu and keeps keyboard focus on a
  // visible nav item (the focused one may have just become display:none).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
      const nav = navRef.current;
      const target = lastFocus.current;
      if (!nav || !target) return;
      const raf =
        window.requestAnimationFrame ?? ((f: () => void) => setTimeout(f, 0));
      raf(() => {
        const active = document.activeElement;
        // Only step in if focus is still in the nav or was dropped to <body>.
        if (active !== document.body && !nav.contains(active)) return;
        if (active === target && isVisible(target)) return;
        const find = (k?: string) =>
          k
            ? [...nav.querySelectorAll<HTMLElement>(`[data-nav="${k}"]`)].find(
                isVisible,
              )
            : undefined;
        (find(target.dataset.nav) ?? find("menu") ?? find("home"))?.focus();
      });
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const links = (onNavigate?: () => void) =>
    siteConfig.nav.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          className={navLink}
          aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          onClick={onNavigate}
          data-nav={item.label.toLowerCase()}
        >
          {item.label}
        </Link>
      </li>
    ));

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-gutter">
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative mx-auto flex max-w-3xl items-center gap-1 rounded-full border bg-background/95 p-1.5 pl-2 backdrop-blur-md"
        onFocus={(e) => {
          lastFocus.current = e.target as HTMLElement;
        }}
        onBlur={(e) => {
          // Focus moving out of the nav closes the menu.
          const next = e.relatedTarget as Node | null;
          if (next && !e.currentTarget.contains(next)) {
            lastFocus.current = null;
            if (open) setOpen(false);
          }
        }}
      >
        <Link
          href="/"
          aria-label="KW, Kyle Whynott, home"
          data-nav="home"
          onClick={() => setOpen(false)}
          className="mr-auto inline-flex min-h-11 items-center rounded-full px-3 font-bold tracking-tight"
        >
          KW
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">{links()}</ul>
        <ThemeToggle navKey="theme" className="hidden sm:inline-flex" />

        <Link
          href={siteConfig.contact.href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 rounded-full px-5",
          )}
          aria-current={
            isCurrent(pathname, siteConfig.contact.href) ? "page" : undefined
          }
          onClick={() => setOpen(false)}
          data-nav="contact"
        >
          {siteConfig.contact.label}
        </Link>

        <button
          ref={menuButton}
          type="button"
          className="menu-button inline-flex size-11 items-center justify-center rounded-full sm:hidden"
          aria-label="Menu"
          data-nav="menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <div
          id="mobile-menu"
          hidden={!open}
          className="absolute inset-x-0 top-full mt-2 rounded-3xl border bg-background p-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 sm:hidden"
        >
          <ul className="flex flex-col">{links(() => setOpen(false))}</ul>
          <ThemeToggle navKey="theme" showLabel className="mt-1 w-full" />
        </div>
      </nav>
    </header>
  );
}
