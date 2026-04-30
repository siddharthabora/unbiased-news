import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Unbiased Today",
  description: "The world, unbiased. Every story traced to its origin, scored for authenticity and neutrality before it reaches you.",
  metadataBase: new URL("https://www.unbiasedtoday.com"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Unbiased Today",
    description: "The world, unbiased. Every story traced to its origin, scored for authenticity and neutrality before it reaches you.",
    url: "https://www.unbiasedtoday.com",
    siteName: "Unbiased Today",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Unbiased Today" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unbiased Today",
    description: "The world, unbiased. Every story traced to its origin, scored for authenticity and neutrality before it reaches you.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
