import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
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
  metadataBase: new URL(siteConfig.url),
  title: { default: "Kyle Whynott", template: "%s · Kyle Whynott" },
  // TODO(kyle): final meta description copy
  description: "Kyle Whynott, AI and software engineer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
              // In @layer base so it outranks Tailwind's layered [hidden]{display:none!important}.
              "@layer base{.theme-toggle,.menu-button{display:none!important}" +
                "@media (max-width:639.98px){#mobile-menu{display:block!important;position:static;margin-top:.5rem}}}"
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
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 pt-24 outline-none">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
