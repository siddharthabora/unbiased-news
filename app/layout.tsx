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
  title: "Unbiased Today: Your Daily Bias-Checked News Digest",
  description: "Every story traced to its origin and scored for authenticity and neutrality before it reaches your inbox. A free, unbiased daily news digest.",
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
    title: "Unbiased Today: Your Daily Bias-Checked News Digest",
    description: "Every story traced to its origin and scored for authenticity and neutrality before it reaches your inbox. A free, unbiased daily news digest.",
    url: "https://www.unbiasedtoday.com",
    siteName: "Unbiased Today",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Unbiased Today" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unbiased Today: Your Daily Bias-Checked News Digest",
    description: "Every story traced to its origin and scored for authenticity and neutrality before it reaches your inbox. A free, unbiased daily news digest.",
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.unbiasedtoday.com/#organization",
                  name: "Unbiased Today",
                  url: "https://www.unbiasedtoday.com",
                  logo: "https://www.unbiasedtoday.com/apple-touch-icon.png",
                  description:
                    "A free daily news email that traces every story to its origin and scores it for authenticity and neutrality.",
                  sameAs: [
                    "https://x.com/unbiased_today",
                    "https://www.youtube.com/@unbiasedtoday",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.unbiasedtoday.com/#website",
                  name: "Unbiased Today",
                  url: "https://www.unbiasedtoday.com",
                  publisher: {
                    "@id": "https://www.unbiasedtoday.com/#organization",
                  },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
