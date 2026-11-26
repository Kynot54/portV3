"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { nextTheme, themeLabel, toThemeChoice } from "@/lib/theme";

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

// True only after hydration, so the server and first client render match.
const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = toThemeChoice(theme);
  const Icon = ICONS[current];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("theme-toggle size-11 rounded-full", className)}
      aria-label={mounted ? themeLabel(current) : "Theme"}
      onClick={() => setTheme(nextTheme(current))}
    >
      {mounted ? (
        <Icon aria-hidden="true" />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
