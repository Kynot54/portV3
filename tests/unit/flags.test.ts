import { isServicesEnabled } from "@/lib/flags";

test('isServicesEnabled: only exact "true"', () => {
  expect(isServicesEnabled({ SERVICES_ENABLED: "true" })).toBe(true);
  for (const v of [undefined, "", "TRUE", "1", "yes", "false", " true"]) {
    expect(isServicesEnabled({ SERVICES_ENABLED: v })).toBe(false);
  }
});
