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

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuButton = useRef<HTMLButtonElement>(null);

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

  // Crossing to desktop width closes the mobile menu.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
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
        >
          {item.label}
        </Link>
      </li>
    ));

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-gutter">
      <nav
        aria-label="Main"
        className="relative mx-auto flex max-w-3xl items-center gap-1 rounded-full border bg-background/85 p-1.5 pl-2 backdrop-blur-md"
      >
        <Link
          href="/"
          aria-label="Kyle Whynott, home"
          className="mr-auto inline-flex min-h-11 items-center rounded-full px-3 font-bold tracking-tight"
        >
          KW
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">{links()}</ul>
        <ThemeToggle className="hidden sm:inline-flex" />

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
        >
          {siteConfig.contact.label}
        </Link>

        <button
          ref={menuButton}
          type="button"
          className="menu-button inline-flex size-11 items-center justify-center rounded-full sm:hidden"
          aria-label="Menu"
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
          <ThemeToggle className="mt-1" />
        </div>
      </nav>
    </header>
  );
}
