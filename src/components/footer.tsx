import { siteConfig } from "@/lib/site";

// No year: Cache Components rejects `new Date()` in prerendered output.
export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-gutter py-10 text-sm text-muted-foreground">
      <p>
        © {siteConfig.name} ·{" "}
        <a
          className="link inline-block py-2"
          href={siteConfig.social.github}
          rel="me noopener"
        >
          GitHub
        </a>{" "}
        ·{" "}
        <a
          className="link inline-block py-2"
          href={siteConfig.social.linkedin}
          rel="me noopener"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  );
}
