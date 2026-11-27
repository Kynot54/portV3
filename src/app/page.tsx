import { About } from "@/components/home/about";
import { ContactCta } from "@/components/home/contact-cta";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getFeaturedWork } from "@/lib/content/load";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  description: SITE_DESCRIPTION,
  path: "/",
});

// Content files only change on deploy, so the read is cacheable (Cache Components).
async function featuredWork() {
  "use cache";
  cacheLife("max");
  return getFeaturedWork();
}

export default async function Home() {
  const featured = await featuredWork();
  return (
    <>
      <Hero />
      <SelectedWork entries={featured} />
      <About />
      <ContactCta />
    </>
  );
}
