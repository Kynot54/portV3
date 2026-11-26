import { loadScript } from "@/lib/load-script";

test("appends one async script per src and resolves on load", async () => {
  const a = loadScript("https://x.test/a.js");
  const b = loadScript("https://x.test/a.js");
  const tags = document.querySelectorAll('script[src="https://x.test/a.js"]');
  expect(tags).toHaveLength(1);
  expect((tags[0] as HTMLScriptElement).async).toBe(true);
  tags[0].dispatchEvent(new Event("load"));
  await expect(Promise.all([a, b])).resolves.toBeDefined();
});

test("rejects on error, and a later call retries", async () => {
  const a = loadScript("https://x.test/b.js");
  document
    .querySelector('script[src="https://x.test/b.js"]')!
    .dispatchEvent(new Event("error"));
  await expect(a).rejects.toThrow();
  loadScript("https://x.test/b.js");
  expect(
    document.querySelectorAll('script[src="https://x.test/b.js"]'),
  ).toHaveLength(1);
});
