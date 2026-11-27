import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { hasBlog } from "@/lib/blog";
import { SITE_ORIGIN } from "@/lib/seo";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: "Kyle Whynott", template: "%s · Kyle Whynott" },
  // No page tags here: each page sets its own through pageMetadata(), so a
  // 404 or a switched-off page never inherits Home's canonical.
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "dark" is the server/no-JS default; next-themes swaps it before paint.
    <html
      lang="en"
      className={cn(
        "dark",
        geistSans.variable,
        geistMono.variable,
        "antialiased",
      )}
      suppressHydrationWarning
    >
      <head>
        <noscript>
          <style>
            {
              // No JS: hide the controls that need it and show the desktop links at
              // every width. In @layer base so the !important outranks Tailwind's
              // layered `hidden` / [hidden] rules.
              "@layer base{.theme-toggle,.menu-button,#mobile-menu,.js-only{display:none!important}" +
                'nav[aria-label="Main"]>ul{display:flex!important}}'
            }
          </style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only z-[60] rounded-full bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <Header showBlog={await hasBlog()} />
          <main id="main" tabIndex={-1} className="flex-1 pt-24 outline-none">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
