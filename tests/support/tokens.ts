import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function block(selector: ":root" | ".dark"): string {
  const re = new RegExp(
    `(^|\\n)${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`,
  );
  const m = css.match(re);
  if (!m) throw new Error(`no ${selector} block in globals.css`);
  return m[2];
}

/** Hex value of a CSS custom property for a theme; throws if missing or not hex. */
export function token(theme: "dark" | "light", name: string): string {
  const body = block(theme === "dark" ? ".dark" : ":root");
  const m = body.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})\\s*;`));
  if (!m) throw new Error(`--${name} is not a #RRGGBB value in ${theme}`);
  return m[1].toUpperCase();
}
