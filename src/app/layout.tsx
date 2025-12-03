import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PosthogProviderLazy } from "@/providers/PosthogProviderLazy";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { getSession } from "@/lib/auth";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PerfVitalsToggle } from "@/components/PerfVitalsToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { WhatNewBanner } from "@/components/WhatNewBanner";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://markdown.town"),
  title: "MarkdownTown",
  description: "Compose, remix, and preview reusable markdown sections for your AI agents.",
  keywords: [
    "markdown",
    "prompts",
    "AI",
    "Next.js",
    "prompt library",
    "prompt composer",
    "sections",
  ],
  openGraph: {
    title: "MarkdownTown",
    description: "Compose, remix, and preview reusable markdown sections for your AI agents.",
    url: "https://markdown.town",
    siteName: "MarkdownTown",
    images: [
      {
        url: "/markdown-town-icon.svg",
        width: 256,
        height: 256,
        alt: "MarkdownTown logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarkdownTown",
    description: "Compose, remix, and preview reusable markdown sections for your AI agents.",
    images: ["/markdown-town-icon.svg"],
  },
  icons: {
    icon: "/markdown-town-icon.svg",
    shortcut: "/markdown-town-icon.svg",
    apple: "/markdown-town-icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <html lang="en" className={[inter.variable, display.variable, mono.variable].join(" ")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" as="image" href="/markdown-town-icon.svg" />
      </head>
      <body className="bg-mdt-bg text-mdt-text font-sans antialiased min-h-screen pb-20 md:pb-0">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <PosthogProviderLazy>
            <SiteNav user={user} />
            <WhatNewBanner />
            <CommandPalette />
            <PerfVitalsToggle />
            <main id="main-content">{children}</main>
            <Footer />
          </PosthogProviderLazy>
        </ThemeProvider>
      </body>
    </html>
  );
}
