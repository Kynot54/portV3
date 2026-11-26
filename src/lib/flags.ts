/** Services ships dark: on only when SERVICES_ENABLED is exactly "true". */
export function isServicesEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.SERVICES_ENABLED === "true";
}
