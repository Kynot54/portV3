export const ABOUT_TEXT =
  "I grew up with analog, came of age with digital, and adapted and evolved with AI. I've lived with all three, so I can explain each one plainly and connect them. I designed and taught a machine learning course to 40+ students at Cal State Fullerton, and I've taught C++ from object-oriented design up to data structures.";

export function About() {
  return (
    <section
      aria-labelledby="about-title"
      className="mx-auto w-full max-w-5xl px-gutter py-section"
    >
      <h2 id="about-title" className="text-h2 font-bold tracking-tight">
        About
      </h2>
      <p className="mt-6 max-w-2xl text-body-fluid text-muted-foreground">
        {ABOUT_TEXT}
      </p>
    </section>
  );
}
