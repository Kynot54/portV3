import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { WorkList } from "@/components/work/work-list";
import { getWorkList } from "@/lib/content/load";

export const metadata: Metadata = { title: "Work" };

// Content only changes on deploy.
async function workList() {
  "use cache";
  cacheLife("max");
  return getWorkList();
}

export default async function WorkPage() {
  return <WorkList entries={await workList()} />;
}
