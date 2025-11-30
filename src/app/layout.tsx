import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PosthogProvider } from "@/providers/PosthogProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-mdt-bg text-mdt-text font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <PosthogProvider>{children}</PosthogProvider>
      </body>
    </html>
  );
}
