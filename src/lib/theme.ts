export type ThemeChoice = "system" | "light" | "dark";

const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const NAME: Record<ThemeChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/** The toggle cycles System → Light → Dark → System. */
export function nextTheme(current: ThemeChoice): ThemeChoice {
  return ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
}

/** Accessible name: the current state and what a click does. */
export function themeLabel(current: ThemeChoice): string {
  return `Theme: ${NAME[current]}. Switch to ${nextTheme(current)}`;
}

export function toThemeChoice(value: string | undefined): ThemeChoice {
  return value === "light" || value === "dark" ? value : "system";
}
