import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  metadataBase: new URL("https://kwhynott.dev"),
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
          <style>{".theme-toggle{display:none!important}"}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
