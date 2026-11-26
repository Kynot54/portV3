import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { WorkList } from "@/components/work/work-list";
import { getWorkList } from "@/lib/content/load";
import { PAGE_DESCRIPTIONS, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: PAGE_DESCRIPTIONS.work,
  path: "/work",
});

// Content only changes on deploy.
async function workList() {
  "use cache";
  cacheLife("max");
  return getWorkList();
}

export default async function WorkPage() {
  return <WorkList entries={await workList()} />;
}
