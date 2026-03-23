import type { Metadata } from "next";
import YouTubeThumbnailDownloaderClient from "./YouTubeThumbnailDownloaderClient";

export const metadata: Metadata = {
  title: "YouTube Thumbnail Downloader | Download HD YouTube Thumbnails",
  description:
    "Free YouTube thumbnail downloader. Paste any YouTube video URL and download thumbnail images in max resolution, HD, standard, and medium quality.",
  alternates: {
    canonical: "/youtube-thumbnail-downloader",
  },
  openGraph: {
    title: "YouTube Thumbnail Downloader | Download HD YouTube Thumbnails",
    description:
      "Free YouTube thumbnail downloader. Paste any YouTube video URL and download thumbnail images in max resolution, HD, standard, and medium quality.",
    url: "https://www.findvideoid.com/youtube-thumbnail-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Thumbnail Downloader | Download HD YouTube Thumbnails",
    description:
      "Free YouTube thumbnail downloader. Paste any YouTube video URL and download thumbnail images in max resolution, HD, standard, and medium quality.",
  },
};

export default function YouTubeThumbnailDownloaderPage() {
  return <YouTubeThumbnailDownloaderClient />;
}