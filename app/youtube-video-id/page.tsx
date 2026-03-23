import type { Metadata } from "next";
import YouTubeVideoIdClient from "./YouTubeVideoIdClient";

export const metadata: Metadata = {
  title: "YouTube Video ID Finder – Extract Video ID from Any URL | Find Video ID",
  description:
    "Free YouTube Video ID finder. Extract the video ID from any YouTube URL including watch, Shorts, youtu.be, embed, and live links instantly.",
  alternates: {
    canonical: "/youtube-video-id",
  },
  openGraph: {
    title: "YouTube Video ID Finder – Extract Video ID from Any URL | Find Video ID",
    description:
      "Free YouTube Video ID finder. Extract the video ID from any YouTube URL including watch, Shorts, youtu.be, embed, and live links instantly.",
    url: "https://www.findvideoid.com/youtube-video-id",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Video ID Finder – Extract Video ID from Any URL | Find Video ID",
    description:
      "Free YouTube Video ID finder. Extract the video ID from any YouTube URL including watch, Shorts, youtu.be, embed, and live links instantly.",
  },
};

export default function YouTubeVideoIdPage() {
  return <YouTubeVideoIdClient />;
}