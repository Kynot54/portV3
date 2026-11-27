import Link from "next/link";
import { isServicesEnabled } from "@/lib/flags";
import { SERVICES_COPY } from "@/lib/services-copy";
import { cn } from "@/lib/utils";

/** "Run a business…? See what I offer." Renders nothing while Services is off. */
export function ServicesLinkLine({ className }: { className?: string }) {
  if (!isServicesEnabled()) return null;
  const { text, link } = SERVICES_COPY.linkLine;
  return (
    <p className={cn("text-body-fluid text-muted-foreground", className)}>
      {text}{" "}
      <Link href="/services" className="link">
        {link}
      </Link>
      .
    </p>
  );
}
