/**
 * Every word on /services, approved by Kyle (2026-11-27; spec:
 * docs/superpowers/specs/2026-11-26-slice-07-services-design.md). The facts
 * test checks all of it against content/source/resume.md.
 */
export const SERVICES_COPY = {
  label: "Services",
  title: "Software for your business, built around how it works.",
  lead: "I build websites and custom software for founders and small businesses. You don't need a technical background. We start with a call, and I work out what you need.",
  cta: { book: "Book a consultation", write: "Send a message" },
  offersTitle: "What I build",
  offers: [
    {
      title: "Websites",
      text: "A site that shows what you do and makes it easy for customers to reach you.",
    },
    {
      title: "Custom software",
      text: "A CRM, an intake or booking tool, or an app that solves one problem in your niche, built around how your business already works.",
    },
    {
      title: "AI that takes on repetitive work",
      text: "Pipelines that read documents and handle routine steps, so your team spends less time on manual review.",
    },
  ],
  training: {
    title: "Teaching your team",
    text: "I teach teams to use technology and AI in their day-to-day work. At Cal State Fullerton I was Teacher of Record for Introduction to Machine Learning: two sections of 40+ students each, on a course I designed myself. I also taught C++ lectures and labs for 60+ students.",
  },
  evidenceTitle: "Work I've done for businesses",
  evidence: [
    {
      slug: "control-bh",
      title: "C.O.N.T.R.O.L. BH",
      text: "A donation web app for a nonprofit, built in under two weeks and maintained for a year. 1,000+ users; donations rose 40%.",
    },
    {
      slug: "video-interview-plugin",
      title: "O'Hagan Electrical",
      text: "A video-interview plugin that screened 100+ applicants. Hiring efficiency rose over 35%.",
    },
    {
      slug: "working-entrepreneurs",
      title: "Working Entrepreneurs",
      text: "Pipelines for 50+ clients that cut manual review by 50%.",
    },
  ],
  stepsTitle: "How it works",
  steps: [
    {
      title: "A free 30-minute call.",
      text: "You tell me about your business and the problem. No technical knowledge needed.",
    },
    {
      title: "A plan and a price.",
      text: "I write up what I'd build, how long it takes, and what it costs.",
    },
    {
      title: "I build it.",
      text: "You see progress as it happens.",
    },
    {
      title: "Handover and support.",
      text: "I train your team on the finished product and transfer full ownership to your business, including the hosting and service accounts and their costs. After launch, I provide ongoing maintenance at a monthly rate until you hire someone to take it over.",
    },
  ],
  contact: {
    title: "Tell me about your business",
    reply: "I reply within 2–3 business days.",
    messageTitle: "Send a message",
    bookingTitle: "Book a call",
    bookingIntro: "A free 30-minute consultation.",
  },
  linkLine: {
    text: "Run a business and need software built?",
    link: "See what I offer",
  },
} as const;

/** Every string above, for the facts test. */
export function servicesCopyText(): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(SERVICES_COPY);
  return out;
}
