import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.findvideoid.com"),
  title: {
    default: "Find Video ID",
    template: "%s | Find Video ID",
  },
  description:
    "Find YouTube channel IDs, video IDs, and download YouTube thumbnails quickly and easily.",
  applicationName: "Find Video ID",
  keywords: [
    "YouTube channel ID finder",
    "YouTube video ID finder",
    "YouTube thumbnail downloader",
    "find YouTube channel ID",
    "find YouTube video ID",
    "download YouTube thumbnail",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.findvideoid.com",
    siteName: "Find Video ID",
    title: "Find Video ID",
    description:
      "Find YouTube channel IDs, video IDs, and download YouTube thumbnails quickly and easily.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Video ID",
    description:
      "Find YouTube channel IDs, video IDs, and download YouTube thumbnails quickly and easily.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}