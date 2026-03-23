import type { Metadata } from "next";
import YouTubeChannelIdClient from "./YouTubeChannelIdClient";

export const metadata: Metadata = {
  title: "YouTube Channel ID Finder – Find Channel ID from Any URL | Find Video ID",
  description:
    "Free YouTube Channel ID finder. Extract a channel ID from a YouTube channel URL, @handle, or video URL in seconds.",
  alternates: {
    canonical: "/youtube-channel-id",
  },
  openGraph: {
    title: "YouTube Channel ID Finder – Find Channel ID from Any URL | Find Video ID",
    description:
      "Free YouTube Channel ID finder. Extract a channel ID from a YouTube channel URL, @handle, or video URL in seconds.",
    url: "https://www.findvideoid.com/youtube-channel-id",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Channel ID Finder – Find Channel ID from Any URL | Find Video ID",
    description:
      "Free YouTube Channel ID finder. Extract a channel ID from a YouTube channel URL, @handle, or video URL in seconds.",
  },
};

export default function YouTubeChannelIdPage() {
  return <YouTubeChannelIdClient />;
}