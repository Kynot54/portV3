"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { nextTheme, themeLabel, themeName, toThemeChoice } from "@/lib/theme";

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

/** `showLabel` adds visible "Theme: System" text (used in the mobile menu). */
export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = toThemeChoice(theme);
  const Icon = ICONS[current];

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      className={cn(
        "theme-toggle rounded-full",
        showLabel ? "h-11 justify-start gap-2 px-3" : "size-11",
        className,
      )}
      aria-label={mounted ? themeLabel(current) : "Theme"}
      onClick={() => setTheme(nextTheme(current))}
    >
      {mounted ? (
        <Icon aria-hidden="true" />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          Theme: {mounted ? themeName(current) : "…"}
        </span>
      )}
    </Button>
  );
}
