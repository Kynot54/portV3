import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="px-gutter pt-12 pb-6 text-center sm:pt-16"
    >
      <p className="micro-label inline-flex items-center gap-2 text-muted-foreground">
        <span
          aria-hidden="true"
          className="accent-glow size-2 rounded-full bg-primary"
        />
        Open to work · AI / Software Engineer
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

      <p className="micro-label mx-auto mt-8 max-w-3xl text-muted-foreground">
        Taught ML at Cal State Fullerton · AI pipelines for 10+ clients · M.S.
        Software Engineering
      </p>

      {/* visual: <ThreeEras /> (Task 3) */}
    </section>
  );
}
