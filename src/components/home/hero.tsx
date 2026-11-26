import Link from "next/link";
import { ThreeEras } from "@/components/home/three-eras";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROOF = [
  "Taught ML at Cal State Fullerton",
  "AI pipelines for 10+ clients",
  "M.S. Software Engineering",
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="px-gutter pt-12 pb-6 text-center sm:pt-16"
    >
      <p className="micro-label text-balance text-muted-foreground">
        <span
          aria-hidden="true"
          data-dot
          className="accent-glow mr-2 inline-block size-2 rounded-full bg-primary align-middle"
        />
        <span className="whitespace-nowrap">Open to work ·</span>{" "}
        <span className="whitespace-nowrap">AI / Software Engineer</span>
      </p>

      <h1 id="hero-title" className="mt-5 text-hero font-bold tracking-tight">
        I&apos;m Kyle Whynott, an AI engineer.
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-body-fluid text-muted-foreground">
        I understand AI systems end to end. I fit them into how a business
        actually works. I design the system first, then build the automations
        and software around it.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/contact"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 px-5 text-sm",
          )}
        >
          Get in touch →
        </Link>
        <Link
          href="#work"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 px-5 text-sm",
          )}
        >
          See my work
        </Link>
      </div>

      <p className="micro-label mx-auto mt-8 max-w-5xl text-balance text-muted-foreground">
        {PROOF.map((item, i) => (
          <span key={item}>
            {i > 0 && " "}
            {/* The separator ends a line rather than starting one. */}
            <span data-proof-item className="whitespace-nowrap">
              {item}
              {i < PROOF.length - 1 && " ·"}
            </span>
          </span>
        ))}
      </p>

      <ThreeEras />
    </section>
  );
}
